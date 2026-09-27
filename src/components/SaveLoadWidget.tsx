import React, { useState } from 'react';
import { ManagerClub, PlayerCoin, OpponentClub } from '../types/manager';
import { Download, Upload, FileText, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface SaveLoadWidgetProps {
  club: ManagerClub;
  squad: PlayerCoin[];
  opponents: OpponentClub[];
  market: PlayerCoin[];
  onImportSave: (saveData: { club: ManagerClub; squad: PlayerCoin[]; opponents: OpponentClub[]; market: PlayerCoin[] }) => void;
  showToast: (text: string, type: 'SUCCESS' | 'ERROR' | 'INFO') => void;
}

export const SaveLoadWidget: React.FC<SaveLoadWidgetProps> = ({
  club,
  squad,
  opponents,
  market,
  onImportSave,
  showToast,
}) => {
  const [pastedJson, setPastedJson] = useState('');
  const [importMode, setImportMode] = useState<'FILE' | 'TEXT'>('FILE');

  const handleExportJSON = () => {
    try {
      const saveData = { club, squad, opponents, market, exportedAt: new Date().toISOString() };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(saveData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `futebol_moedas_save_${club.name.replace(/\s+/g, '_')}_temporada_${club.season}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Arquivo JSON de save exportado com sucesso!', 'SUCCESS');
    } catch (err) {
      console.error(err);
      showToast('Erro ao exportar save JSON.', 'ERROR');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed && parsed.club && Array.isArray(parsed.squad)) {
          onImportSave(parsed);
          showToast('Progresso da carreira restaurado com sucesso!', 'SUCCESS');
        } else {
          showToast('Arquivo JSON inválido para o Modo Carreira.', 'ERROR');
        }
      } catch (err) {
        console.error(err);
        showToast('Erro ao ler o arquivo JSON.', 'ERROR');
      }
    };
    reader.readAsText(file);
  };

  const handleImportText = () => {
    if (!pastedJson.trim()) {
      showToast('Cole o conteúdo JSON do save no campo abaixo.', 'ERROR');
      return;
    }
    try {
      const parsed = JSON.parse(pastedJson.trim());
      if (parsed && parsed.club && Array.isArray(parsed.squad)) {
        onImportSave(parsed);
        setPastedJson('');
        showToast('Progresso da carreira restaurado com sucesso via JSON!', 'SUCCESS');
      } else {
        showToast('O JSON colado não contém a estrutura válida de save.', 'ERROR');
      }
    } catch (err) {
      console.error(err);
      showToast('JSON malformado ou inválido.', 'ERROR');
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white tracking-tight">
              Exportar & Restaurar Save (JSON)
            </h3>
            <p className="text-[10px] text-neutral-400">
              Guarde seu progresso num arquivo JSON ou restaure seu Modo Carreira colando os dados
            </p>
          </div>
        </div>

        <button
          onClick={handleExportJSON}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar Save (.json)</span>
        </button>
      </div>

      <div className="pt-3 border-t border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-300">Restaurar Progresso Anterior</span>
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            <button
              onClick={() => setImportMode('FILE')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                importMode === 'FILE' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Arquivo (.json)
            </button>
            <button
              onClick={() => setImportMode('TEXT')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                importMode === 'TEXT' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Colar Código (Textarea)
            </button>
          </div>
        </div>

        {importMode === 'FILE' ? (
          <div className="flex items-center justify-center border-2 border-dashed border-neutral-700 hover:border-amber-500/60 rounded-xl p-5 bg-neutral-950/50 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="text-center space-y-1.5">
              <Upload className="w-6 h-6 text-amber-400 mx-auto" />
              <p className="text-xs font-medium text-neutral-200">
                Clique aqui para selecionar o arquivo <span className="text-amber-400">.json</span> de save
              </p>
              <p className="text-[10px] text-neutral-500">O jogo será carregado instantaneamente com seu clube e elenco</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              value={pastedJson}
              onChange={(e) => setPastedJson(e.target.value)}
              placeholder="Cole aqui o conteúdo JSON exportado anteriormente..."
              rows={4}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 font-mono focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end">
              <button
                onClick={handleImportText}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs border border-neutral-700 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Restaurar Carreira</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
