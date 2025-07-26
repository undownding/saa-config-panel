'use client';

import { useState } from 'react';
import { GameConfig, UpdateData, Position } from '@/types/config';
import LoadingSpinner from './LoadingSpinner';

interface UpdateDataEditorProps {
  config: GameConfig;
  onUpdate: (newConfig: GameConfig, token: string) => Promise<boolean>;
}

export default function UpdateDataEditor({ config, onUpdate }: UpdateDataEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState<UpdateData>(config.updateData);
  const [editingGameVersion, setEditingGameVersion] = useState<string>(config.version);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const startEditing = () => {
    setEditingData({ ...config.updateData });
    setEditingGameVersion(config.version);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditingData(config.updateData);
    setEditingGameVersion(config.version);
    setIsEditing(false);
    setToken('');
  };

  const updateField = (field: keyof UpdateData, value: number) => {
    setEditingData({ ...editingData, [field]: value });
  };

  const updatePosition = (type: 'stuff' | 'chasm', field: keyof Position, value: number) => {
    setEditingData({
      ...editingData,
      [type]: {
        ...editingData[type],
        [field]: value
      }
    });
  };

  const saveChanges = async () => {
    if (!token.trim()) {
      alert('请输入授权令牌');
      return;
    }

    setLoading(true);
    const newConfig = {
      ...config,
      version: editingGameVersion,
      updateData: editingData
    };

    const success = await onUpdate(newConfig, token.trim());
    if (success) {
      setIsEditing(false);
      setToken('');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span>⚙️</span>
            更新数据配置
          </h2>
          
          {!isEditing ? (
            <button
              onClick={startEditing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <span>✏️</span>
              编辑配置
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={cancelEditing}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                取消
              </button>
              <button
                onClick={saveChanges}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <LoadingSpinner size="sm" /> : <span>💾</span>}
                保存更改
              </button>
            </div>
          )}
        </div>

        {isEditing && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              授权令牌 (Bearer Token)
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="请输入 Bearer Token"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* 基本配置 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>🎮</span>
          基本设置
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SAA版本
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editingGameVersion}
                onChange={(e) => setEditingGameVersion(e.target.value)}
                placeholder="例如: 1.0.0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md font-mono font-semibold">
                {config.version}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              在线宽度 (px)
            </label>
            {isEditing ? (
              <input
                type="number"
                value={editingData.onlineWidth}
                onChange={(e) => updateField('onlineWidth', parseInt(e.target.value) || 0)}
                min="1"
                max="10000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md font-mono font-semibold">
                {config.updateData.onlineWidth}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              在线高度 (px)
            </label>
            {isEditing ? (
              <input
                type="number"
                value={editingData.onlineHeight}
                onChange={(e) => updateField('onlineHeight', parseInt(e.target.value) || 0)}
                min="1"
                max="10000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md font-mono font-semibold">
                {config.updateData.onlineHeight}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Link ID
            </label>
            {isEditing ? (
              <input
                type="number"
                value={editingData.linkId}
                onChange={(e) => updateField('linkId', parseInt(e.target.value) || 0)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md font-mono font-semibold">
                {config.updateData.linkId}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Link Category ID
            </label>
            {isEditing ? (
              <input
                type="number"
                value={editingData.linkCatId}
                onChange={(e) => updateField('linkCatId', parseInt(e.target.value) || 0)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md font-mono font-semibold">
                {config.updateData.linkCatId}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stuff 位置配置 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>📦</span>
          Stuff 位置配置
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              X1 坐标
            </label>
            {isEditing ? (
              <input
                type="number"
                value={editingData.stuff.x1}
                onChange={(e) => updatePosition('stuff', 'x1', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md font-mono font-semibold">
                {config.updateData.stuff.x1}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Y1 坐标
            </label>
            {isEditing ? (
              <input
                type="number"
                value={editingData.stuff.y1}
                onChange={(e) => updatePosition('stuff', 'y1', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md font-mono font-semibold">
                {config.updateData.stuff.y1}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              X2 坐标
            </label>
            {isEditing ? (
              <input
                type="number"
                value={editingData.stuff.x2}
                onChange={(e) => updatePosition('stuff', 'x2', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md font-mono font-semibold">
                {config.updateData.stuff.x2}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Y2 坐标
            </label>
            {isEditing ? (
              <input
                type="number"
                value={editingData.stuff.y2}
                onChange={(e) => updatePosition('stuff', 'y2', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md font-mono font-semibold">
                {config.updateData.stuff.y2}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            区域大小: {Math.abs((isEditing ? editingData : config.updateData).stuff.x2 - (isEditing ? editingData : config.updateData).stuff.x1)} × {Math.abs((isEditing ? editingData : config.updateData).stuff.y2 - (isEditing ? editingData : config.updateData).stuff.y1)} 像素
          </div>
        </div>
      </div>

      {/* Chasm 位置配置 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>🕳️</span>
          Chasm 位置配置
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              X1 坐标
            </label>
            {isEditing ? (
              <input
                type="number"
                value={editingData.chasm.x1}
                onChange={(e) => updatePosition('chasm', 'x1', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md font-mono font-semibold">
                {config.updateData.chasm.x1}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Y1 坐标
            </label>
            {isEditing ? (
              <input
                type="number"
                value={editingData.chasm.y1}
                onChange={(e) => updatePosition('chasm', 'y1', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md font-mono font-semibold">
                {config.updateData.chasm.y1}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              X2 坐标
            </label>
            {isEditing ? (
              <input
                type="number"
                value={editingData.chasm.x2}
                onChange={(e) => updatePosition('chasm', 'x2', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md font-mono font-semibold">
                {config.updateData.chasm.x2}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Y2 坐标
            </label>
            {isEditing ? (
              <input
                type="number"
                value={editingData.chasm.y2}
                onChange={(e) => updatePosition('chasm', 'y2', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md font-mono font-semibold">
                {config.updateData.chasm.y2}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            区域大小: {Math.abs((isEditing ? editingData : config.updateData).chasm.x2 - (isEditing ? editingData : config.updateData).chasm.x1)} × {Math.abs((isEditing ? editingData : config.updateData).chasm.y2 - (isEditing ? editingData : config.updateData).chasm.y1)} 像素
          </div>
        </div>
      </div>
    </div>
  );
}
