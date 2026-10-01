# FileDrop examples

A drop zone and file picker with type and size checks and per-file status chips.

```tsx
import { FileDrop } from "@/components/ui";

<FileDrop files={files} onFilesChange={setFiles} accept={[".pdf"]} multiple={false} />
```

## Default

```tsx
<FileDrop files={files} onFilesChange={setFiles} />
```

Docs: https://rime.mjsons.net/components/file-drop
