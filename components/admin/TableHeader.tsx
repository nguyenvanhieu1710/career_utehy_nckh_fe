export function TableHeader() {
  return (
    <div className="grid grid-cols-12 gap-4 border-b pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
      <div className="col-span-1">STT</div>
      <div className="col-span-1">Avatar</div>
      <div className="col-span-3">Tên người dùng</div>
      <div className="col-span-3">Email</div>
      <div className="col-span-2">Vai trò</div>
      <div className="col-span-1 text-center">Trạng thái</div>
      <div className="col-span-1 text-right">Thao tác</div>
    </div>
  );
}