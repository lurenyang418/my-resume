interface FileSystemPermissionDescriptor {
  mode: "read" | "readwrite";
}

interface FileSystemHandle {
  queryPermission(descriptor?: FileSystemPermissionDescriptor): Promise<"granted" | "denied" | "prompt">;
  requestPermission(descriptor?: FileSystemPermissionDescriptor): Promise<"granted" | "denied" | "prompt">;
}
