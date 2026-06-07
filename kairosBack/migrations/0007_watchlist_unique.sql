DELETE FROM watchlist_items
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      row_number() OVER (
        PARTITION BY account_id, business_id
        ORDER BY saved_at ASC, id ASC
      ) AS duplicate_rank
    FROM watchlist_items
  ) ranked_watchlist_items
  WHERE duplicate_rank > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS watchlist_items_account_business_unique_idx
  ON watchlist_items (account_id, business_id);
