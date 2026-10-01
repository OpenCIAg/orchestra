# Select public-input follow-up — 2026-09-23

The Select audit closed its 38 previously unasserted live inputs and repaired two behavior gaps. The `name` input was attached to a `div`, so it never participated in native form submission; it now renders hidden form fields for selected scalar or multiple values and omits them while disabled. Whitespace-only ARIA labels and filter placeholders now fall back to useful defaults, including the search field name `Filter options`.

The combined Select behavior/input suites pass **31/31**. They cover all 60 supported input/model entries; 18 unsupported compatibility inputs are explicitly deprecated. Tests exercise all filter match modes, custom option mappings and disabled values, locale-aware queries, native `FormData` submission, attachment and panel presentation, z-index, focus controls, loading/empty messages, clear actions, and CVA focus timing ([focused log](focused-tests.log), [input classification](input-classification.md)).

The broader integrated gate records full-library, package, SSR, docs, and build validation after these changes.
