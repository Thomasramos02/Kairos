import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'

const nodeRequire = createRequire(import.meta.url)
const moduleCache = new Map()

export function loadTsModule(relativePath) {
  const root = resolve(import.meta.dirname, '..')
  return loadModule(resolve(root, relativePath))
}

function loadModule(absolutePath) {
  if (moduleCache.has(absolutePath)) return moduleCache.get(absolutePath).exports

  const source = readFileSync(absolutePath, 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: absolutePath,
  }).outputText

  const module = { exports: {} }
  moduleCache.set(absolutePath, module)

  const requireFromModule = (specifier) => {
    if (!specifier.startsWith('.')) return nodeRequire(specifier)

    const base = resolve(dirname(absolutePath), specifier)
    const resolvedPath = resolveLocalModule(base)
    return loadModule(resolvedPath)
  }

  vm.runInNewContext(compiled, {
    Blob,
    Date,
    Math,
    URL,
    console,
    document: undefined,
    exports: module.exports,
    module,
    navigator: undefined,
    require: requireFromModule,
    setTimeout,
  }, { filename: absolutePath })

  return module.exports
}

function resolveLocalModule(basePath) {
  for (const candidate of [`${basePath}.ts`, `${basePath}.tsx`, `${basePath}.js`, basePath]) {
    if (existsSync(candidate)) return candidate
  }

  throw new Error(`Unable to resolve local test module import: ${basePath}`)
}
