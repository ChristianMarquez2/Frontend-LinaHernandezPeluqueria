import { useState, useEffect } from 'react';
import { CreditCard, Download, Eye, CheckCircle, Clock, AlertCircle, Search } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { dataService } from '../../../contexts/data/service';
import { toast } from 'sonner';

// Definimos la interfaz exacta de lo que devuelve tu backend en /transfer-proofs
interface PaymentProof {
  _id: string; // ID del pago
  bookingId: string; // ID de la reserva (para confirmar)
  paymentStatus: string;
  amount?: number;
  precio?: number; // Alias
  inicio?: string; // Fecha cita
  transferProofUrl: string;
  transferProofUploadedAt?: string;
  clientName?: string;
  serviceName?: string;
  method?: string;
}

export function PaymentsManagement() {
  const token = localStorage.getItem('accessToken') || '';
  
  const [payments, setPayments] = useState<PaymentProof[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentProof[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtros
  const [searchClient, setSearchClient] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Modal de detalles
  const [selectedPayment, setSelectedPayment] = useState<PaymentProof | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar pagos
  useEffect(() => {
    fetchPayments();
  }, []);

  // Filtrar cuando cambian los criterios
  useEffect(() => {
    let filtered = payments;

    // Filtrar por estado de pago
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(p => p.paymentStatus === filterStatus);
    }

    // Filtrar por cliente (nombre)
    if (searchClient) {
      filtered = filtered.filter(p => {
        const name = p.clientName || 'Cliente';
        return name.toLowerCase().includes(searchClient.toLowerCase());
      });
    }

    setFilteredPayments(filtered);
  }, [payments, searchClient, filterStatus]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      // ✅ Llamamos al endpoint correcto
      const response = await dataService.listTransferProofs(token);
      // El backend devuelve { count: N, data: [...] }
      setPayments(response.data || []);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error al cargar pagos');
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = async (bookingId: string) => {
    if (!bookingId) return;
    try {
      // ✅ Enviamos el bookingId que es lo que pide la ruta
      await dataService.confirmTransferPayment(token, bookingId);
      toast.success('Pago confirmado exitosamente');
      
      // Recargar lista y cerrar modal
      await fetchPayments();
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al confirmar pago');
    }
  };

  // --- HELPERS VISUALES ---

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-900 text-green-300 border-green-700';
      case 'PENDING': return 'bg-yellow-900 text-yellow-300 border-yellow-700';
      case 'FAILED': return 'bg-red-900 text-red-300 border-red-700';
      default: return 'bg-gray-900 text-gray-300 border-gray-700';
    }
  };

  const getPaymentStatusLabel = (status?: string) => {
    switch (status) {
      case 'PAID': return 'Pagado';
      case 'PENDING': return 'Pendiente';
      case 'FAILED': return 'Fallido';
      default: return status || 'Desconocido';
    }
  };

  const getPaymentStatusIcon = (status?: string) => {
    switch (status) {
      case 'PAID': return <CheckCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('es-EC', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Helpers de datos seguros
  const getClientName = (p: PaymentProof) => p.clientName || 'Cliente sin nombre';
  const getServiceName = (p: PaymentProof) => p.serviceName || 'Servicio';
  const getAmount = (p: PaymentProof) => p.amount || p.precio || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-[#D4AF37] text-xl font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Gestión de Pagos
          </h2>
          <p className="text-gray-400 text-sm">
            Visualiza y confirma todos los comprobantes de transferencia recibidos
          </p>
        </div>

        {/* Barra de Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-gray-900/50 p-4 rounded-lg border border-gray-800">
          {/* Búsqueda por cliente */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar cliente..."
              value={searchClient}
              onChange={(e) => setSearchClient(e.target.value)}
              className="bg-black border-gray-700 text-white pl-10"
            />
          </div>

          {/* Filtro por estado de pago */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-black border-gray-700 text-white">
              <SelectValue placeholder="Estado de pago" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="ALL">Todos los estados</SelectItem>
              <SelectItem value="PENDING">Pendiente</SelectItem>
              <SelectItem value="PAID">Pagado</SelectItem>
            </SelectContent>
          </Select>

          {/* Botón de actualizar */}
          <Button
            onClick={fetchPayments}
            disabled={isLoading}
            className="bg-[#9D8EC1] hover:bg-[#8A7BAF] text-black font-medium"
          >
            {isLoading ? 'Cargando...' : 'Actualizar Lista'}
          </Button>
        </div>
      </div>

      {/* Tabla de Pagos */}
      {isLoading ? (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex justify-center py-12">
              <div className="text-gray-400 animate-pulse">Cargando comprobantes...</div>
            </div>
          </CardContent>
        </Card>
      ) : filteredPayments.length === 0 ? (
        <Card className="bg-gray-900/50 border-gray-800 border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-12 text-gray-500">
              <div className="bg-gray-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-gray-600" />
              </div>
              <p className="text-lg font-medium text-gray-400">
                No hay pagos pendientes o registrados
              </p>
              <p className="text-sm">Intenta cambiar los filtros</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-gray-800/50">
                    <TableHead className="text-[#D4AF37]">Cliente</TableHead>
                    <TableHead className="text-[#D4AF37]">Servicio</TableHead>
                    <TableHead className="text-[#D4AF37] text-right">Monto</TableHead>
                    <TableHead className="text-[#D4AF37]">Fecha Subida</TableHead>
                    <TableHead className="text-[#D4AF37]">Estado</TableHead>
                    <TableHead className="text-[#D4AF37] text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow
                      key={payment._id}
                      className="border-gray-800 hover:bg-gray-800/30 transition-colors"
                    >
                      <TableCell className="text-white font-medium">
                        {getClientName(payment)}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {getServiceName(payment)}
                      </TableCell>
                      <TableCell className="text-right text-green-400 font-semibold">
                        ${getAmount(payment).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-gray-300 text-sm">
                        {formatDate(payment.transferProofUploadedAt || payment.inicio)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getPaymentStatusColor(payment.paymentStatus)} border flex items-center gap-1 w-fit`}>
                          {getPaymentStatusIcon(payment.paymentStatus)}
                          {getPaymentStatusLabel(payment.paymentStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setIsModalOpen(true);
                          }}
                          size="sm"
                          variant="ghost"
                          className="text-[#D4AF37] hover:text-[#D4AF37] hover:bg-gray-800/50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Detalles del Pago */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#9D8EC1]">Detalles del Comprobante</DialogTitle>
            <DialogDescription className="text-gray-400">
              Revisa el comprobante y confirma el pago
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-6 py-4">
              {/* Información Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                  <p className="text-gray-500 text-xs uppercase mb-1">Cliente</p>
                  <p className="text-white font-semibold">{getClientName(selectedPayment)}</p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                  <p className="text-gray-500 text-xs uppercase mb-1">Servicio</p>
                  <p className="text-white font-semibold">{getServiceName(selectedPayment)}</p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                  <p className="text-gray-500 text-xs uppercase mb-1">Monto</p>
                  <p className="text-green-400 font-bold text-lg">
                    ${getAmount(selectedPayment).toFixed(2)}
                  </p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                  <p className="text-gray-500 text-xs uppercase mb-1">Fecha Subida</p>
                  <p className="text-white font-semibold">{formatDate(selectedPayment.transferProofUploadedAt)}</p>
                </div>
              </div>

              {/* Imagen del Comprobante */}
              {selectedPayment.transferProofUrl ? (
                <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                  <p className="text-gray-500 text-xs uppercase mb-3">Comprobante de Transferencia</p>
                  <div className="bg-black rounded-lg overflow-hidden border border-gray-700 flex justify-center">
                    <img
                      src={selectedPayment.transferProofUrl}
                      alt="Comprobante"
                      className="max-w-full h-auto max-h-[400px] object-contain"
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <a
                      href={selectedPayment.transferProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        className="w-full border-gray-700 hover:border-gray-600 text-[#D4AF37]"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Ver tamaño completo / Descargar
                      </Button>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200 text-center text-sm">
                  ⚠️ No se ha encontrado la imagen del comprobante.
                </div>
              )}

              {/* Botón de Confirmar Pago */}
              {selectedPayment.paymentStatus !== 'PAID' && (
                <Button
                  onClick={() => handleConfirmPayment(selectedPayment.bookingId)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12 text-lg shadow-lg shadow-green-900/20"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Confirmar Pago y Reservar Cita
                </Button>
              )}

              {selectedPayment.paymentStatus === 'PAID' && (
                <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 text-center">
                  <p className="text-green-400 font-semibold flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Pago Confirmado Correctamente
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}