'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function UserDebugInfo() {
  const [userInfo, setUserInfo] = useState<{ id: string; email: string } | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    async function getUserInfo() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        setUserInfo({ id: user.id, email: user.email });
      }
    }
    getUserInfo();
  }, []);

  if (!userInfo) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShow(!show)}
        className="bg-gray-800 text-white px-3 py-1 rounded text-xs hover:bg-gray-700"
      >
        {show ? '隠す' : 'デバッグ情報'}
      </button>
      
      {show && (
        <div className="absolute bottom-10 right-0 bg-black text-white p-4 rounded shadow-lg max-w-sm text-xs">
          <h3 className="font-bold mb-2">ユーザー情報</h3>
          <div className="space-y-1">
            <div>
              <strong>ID:</strong>
              <div className="break-all bg-gray-800 p-1 rounded mt-1 select-all">
                {userInfo.id}
              </div>
            </div>
            <div>
              <strong>Email:</strong> {userInfo.email}
            </div>
            <div className="pt-2">
              <button
                onClick={() => navigator.clipboard.writeText(userInfo.id)}
                className="bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-xs"
              >
                IDをコピー
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}