import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { useData } from '../../../contexts/data';
import { dataService } from '../../../contexts/data/service';
import { BankInfo } from '../../../types/api';
import { UploadCloud, CheckCircle, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface TransferPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string | null;
  onSuccess?: () => void;
}

export function TransferPaymentDialog({ isOpen, onClose, bookingId, onSuccess }: TransferPaymentDialogProps) {
  const token = localStorage.getItem("accessToken") || "";

  const [step, setStep] = useState<'LOADING' | 'INFO' | 'UPLOAD' | 'SUCCESS'>('LOADING');
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Al abrir, pedimos la info de pago al backend
  useEffect(() => {
    if (isOpen && bookingId) {
      setStep('LOADING');
      dataService.requestTransfer(token, bookingId)
        .then((res) => {
          setBankInfo(res.bankInfo);
          setAmount(res.amount);
          setStep('INFO');
        })
        .catch((err) => {
          toast.error(err.message);
          onClose();
        });
    }
  }, [isOpen, bookingId, token]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!bookingId || !selectedFile) return;

    setIsUploading(true);
    try {
      await dataService.uploadTransferProof(token, bookingId, selectedFile);
      setStep('SUCCESS');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Error al subir imagen");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* CAMBIOS APLICADOS AQUÍ:
         1. max-w-[400px]: Fuerza que la caja sea angosta.
         2. w-[95%]: Evita que toque los bordes en pantallas muy pequeñas.
         3. rounded-2xl: Bordes más redondeados para estética de tarjeta.
      */}
      <DialogContent className="bg-gray-900 border-gray-800 text-white w-[95%] max-w-[400px] rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-[#9D8EC1] text-xl text-center">
            {step === 'SUCCESS' ? '¡Comprobante Enviado!' : 'Pago por Transferencia'}
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            {step === 'INFO' && "Realiza la transferencia a la siguiente cuenta:"}
            {step === 'UPLOAD' && "Sube la captura de pantalla de tu transferencia."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {step === 'LOADING' && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#9D8EC1]" />
            </div>
          )}

          {step === 'INFO' && bankInfo && (
            <div className="space-y-4">
              <div className="bg-black/30 p-4 rounded-xl border border-gray-800 space-y-3 shadow-inner">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 text-xs uppercase">Banco</span>
                  <span className="font-bold">{bankInfo.bank}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 text-xs uppercase">Tipo</span>
                  <span className="font-medium">{bankInfo.accountType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs uppercase">Número</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg text-[#D4AF37] tracking-wider">{bankInfo.accountNumber}</span>
                    <button onClick={() => handleCopy(bankInfo.accountNumber)} className="p-1 hover:bg-gray-800 rounded transition-colors">
                      <Copy className="h-4 w-4 text-gray-400 hover:text-white" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 text-xs uppercase">Titular</span>
                  <span className="font-medium text-right text-xs sm:text-sm">{bankInfo.accountHolder}</span>
                </div>
                <div className="pt-2 border-t border-gray-700 flex justify-between items-center">
                  <span className="text-gray-500 text-xs uppercase">Referencia</span>
                  <span className="font-mono bg-gray-800 px-2 py-1 rounded text-xs">{bankInfo.reference}</span>
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-gray-500 text-xs uppercase font-bold">Total</span>
                  <span className="font-bold text-xl text-green-400">${amount.toFixed(2)}</span>
                </div>
              </div>

              <Button onClick={() => setStep('UPLOAD')} className="w-full bg-[#9D8EC1] hover:bg-[#8A7BAF] text-black font-bold rounded-xl transition-all">
                Subir Comprobante
              </Button>
            </div>
          )}

          {step === 'UPLOAD' && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-900/50 hover:bg-gray-800/50 transition-colors cursor-pointer relative min-h-[160px]">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                {selectedFile ? (
                  <div className="text-center animate-in fade-in zoom-in duration-300">
                    <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Clic para cambiar</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <UploadCloud className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-300">Toca para seleccionar imagen</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG o WebP</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep('INFO')} disabled={isUploading} className="btn-red">
                  Atrás
                </Button>
                <Button
                  onClick={handleUpload}
                  className="btn-confirm" // <--- Aquí usas la clase nueva
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Confirmar
                </Button>
              </div>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">¡Recibido!</h3>
              <p className="text-gray-400 text-sm px-4">
                Hemos recibido tu comprobante. Tu cita será confirmada en breve.
              </p>
              <Button onClick={onClose} className="mt-6 w-full bg-gray-800 hover:bg-gray-700 rounded-xl">
                Cerrar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}