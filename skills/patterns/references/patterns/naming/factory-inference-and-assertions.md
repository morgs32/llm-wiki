# Factory inference and restrained assertions

Fix a generic factory or its base type when its result loses a required field or literal. Preserve inference at callers; do not annotate away a mismatch, spread missing fields onto the result, or bolt fields onto a generic return with an intersection. Model the field and literal generic at the owning base type.

Prefer plain literals and an appropriate factory signature, annotation, or `satisfies` constraint. Do not add `as const` or `as const satisfies` to object literals or shape maps unless requested or needed to resolve a demonstrated type error. Assertions must not hide the underlying contract mismatch.
