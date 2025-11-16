'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ActionButtons } from './ActionButtons';

interface User {
  id: number;
  avatar?: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

interface TableRowProps {
  user: User;
  index: number;
}

export function TableRow({ user, index }: TableRowProps) {
  const isActive = user.status === 'active';

  return (
    <div className="grid grid-cols-12 gap-4 items-center py-3 border-b hover:bg-gray-50 transition-colors">
      <div className="col-span-1 text-sm text-gray-600">{index}</div>
      
      <div className="col-span-1">
        <Avatar className="h-9 w-9">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="bg-gray-200 text-gray-500 text-xs">
            {user.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="col-span-3">
        <p className="font-medium text-gray-900">{user.name}</p>
      </div>
      
      <div className="col-span-3 text-sm text-gray-600">{user.email}</div>
      
      <div className="col-span-2">
        <span className="text-sm text-gray-700">{user.role}</span>
      </div>
      
      <div className="col-span-1 text-center">
        <Badge
          variant={isActive ? 'default' : 'destructive'}
          className={cn(
            'text-xs px-2 py-0.5',
            isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-rose-100 text-rose-700'
          )}
        >
          {isActive ? 'Còn hoạt động' : 'Ngừng hoạt động'}
        </Badge>
      </div>
      
      <div className="col-span-1 flex justify-end gap-1">
        <ActionButtons />
      </div>
    </div>
  );
}