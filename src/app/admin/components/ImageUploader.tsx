export default function ImageUploader({ name = "files" }: { name?: string }) {
  return (
    <div className="rounded border border-dashed p-4">
      <label className="block text-sm font-medium">Add images</label>
      <input
        type="file"
        name={name}
        multiple
        accept="image/*"
        className="mt-2 block w-full text-sm"
      />
      <p className="mt-1 text-xs text-neutral-600">You can select multiple files. JPG/PNG/WebP recommended.</p>
    </div>
  );
}
