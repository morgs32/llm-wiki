# Never store canonical bytes in SQL

Storing canonical bytes of anything in a SQL database is absolutely prohibited.
The prohibition applies regardless of column name or type, including canonical
JSON strings, text, and blobs. Retry, deduplication, replay, checkpoint, audit,
or performance arguments do not create exceptions.

Encountering existing canonical-byte storage, or proposing it, must prompt a
deep architectural design discussion before implementing the affected design.
Do not treat it as a routine serialization or schema cleanup.

1. Identify the authoritative data and its owner, and trace every writer and
   reader of the stored bytes.
2. State the actual invariant the byte comparison is meant to enforce. Examine
   identity, immutability, ordering, retries, and crash recovery where relevant.
3. Investigate why the consumer needs a retained copy or checkpoint, whether it
   duplicates another owner's responsibility, and whether the check is needed.
4. Resolve the ownership and persistence design with the user before changing
   it. Do not silently substitute hashes, fingerprints, renamed columns, or
   another serialized envelope for the prohibited bytes.

Persist domain data in its agreed schema. Ordinary JSON-valued domain fields do
not justify storing a canonical serialization of the enclosing record alongside
or instead of that schema.
