import { useState, useEffect, useMemo } from 'react';
import { CreditCard, Download, Eye, CheckCircle, Clock, AlertCircle, Search } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { dataService } from '../../../contexts/data/service';
import { toast } from 'sonner';
import { useServices } from '../../../contexts/data/context/ServicesContext';

// Definimos la interfaz exacta de lo que devuelve tu backend en /transfer-proofs
interface PaymentProof {
    _id: string; // ID del pago
    bookingId: string; // ID de la reserva (para confirmar)
    paymentStatus: string;
    amount?: number;
    precio?: number; // Alias
    serviceId?: string;
    service?: { _id?: string; nombre?: string; name?: string; precio?: number; price?: number };
    // A veces el backend puede incluir la reserva poblada
    booking?: {
        servicioId?: string;
        servicio?: { _id?: string; nombre?: string; precio?: number };
        service?: { _id?: string; nombre?: string; precio?: number };
        price?: number;
        precio?: number;
    };
    inicio?: string; // Fecha cita
    transferProofUrl: string;
    transferProofUploadedAt?: string;
    clientName?: string;
    serviceName?: string;
    method?: string;
}

export function PaymentsManagement() {
    const token = localStorage.getItem('accessToken') || '';
    const { services } = useServices();

    const [payments, setPayments] = useState<PaymentProof[]>([]);
    const [filteredPayments, setFilteredPayments] = useState<PaymentProof[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filtros
    const [searchClient, setSearchClient] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Modal de detalles
    const [selectedPayment, setSelectedPayment] = useState<PaymentProof | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mapa rápido para nombre y precio de servicio
    const serviceMap = useMemo(() => {
        const map: Record<string, { name: string; price: number }> = {};
        services.forEach((s) => {
            const id = s._id || s.id;
            if (!id) return;
            map[id] = {
                name: s.nombre || s.name || 'Servicio',
                price: Number(s.precio ?? s.price ?? 0),
            };
        });
        return map;
    }, [services]);

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
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    // Helpers de datos seguros
    const getClientName = (p: PaymentProof) => p.clientName || 'Cliente sin nombre';
    const getServiceName = (p: PaymentProof) => {
        if (p.serviceName) return p.serviceName;
        if (p.service?.nombre || p.service?.name) return p.service.nombre || p.service.name || 'Servicio';

        // Si vino la reserva populada, intentamos extraer nombre de servicio
        const bookingServiceName =
            (p.booking?.servicio as any)?.nombre ||
            (p.booking?.service as any)?.nombre;
        if (bookingServiceName) return bookingServiceName;

        // Map de catálogo
        const srvId = p.serviceId || p.booking?.servicioId;
        if (srvId && serviceMap[srvId]) return serviceMap[srvId].name;
        return 'Servicio';
    };

    const getAmount = (p: PaymentProof) => {
        const candidates = [
            p.amount,
            p.precio,
            p.service?.precio,
            p.service?.price,
            p.booking?.precio,
            p.booking?.price,
            (p.booking?.servicio as any)?.precio,
            (p.booking?.service as any)?.precio,
        ];

        for (const c of candidates) {
            if (c === undefined || c === null) continue;
            const n = Number(c);
            if (Number.isFinite(n)) return n;
        }

        const srvId = p.serviceId || p.booking?.servicioId;
        if (srvId && serviceMap[srvId]) return serviceMap[srvId].price;
        return 0;
    };

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

            {/* Modal de Detalles del Pago (Estilo Formulario Servicio) */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-[#D4AF37] flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Detalles del Comprobante
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Revisa la información adjunta y confirma el pago.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPayment && (
                        <div className="space-y-4 py-2">

                            {/* Grid de Información (Simulando Inputs) */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Cliente */}
                                <div className="space-y-2">
                                    <span className="text-sm font-medium leading-none text-white">Cliente</span>
                                    <div className="w-full bg-black border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300">
                                        {getClientName(selectedPayment)}
                                    </div>
                                </div>

                                {/* Servicio */}
                                <div className="space-y-2">
                                    <span className="text-sm font-medium leading-none text-white">Servicio</span>
                                    <div className="w-full bg-black border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300">
                                        {getServiceName(selectedPayment)}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Monto */}
                                <div className="space-y-2">
                                    <span className="text-sm font-medium leading-none text-white">Monto</span>
                                    <div className="w-full bg-black border border-gray-700 rounded-md px-3 py-2 text-sm font-bold text-green-400 flex justify-between items-center">
                                        <span>${getAmount(selectedPayment).toFixed(2)}</span>
                                        <Badge className={`${getPaymentStatusColor(selectedPayment.paymentStatus)} border-0 text-[10px] px-1.5 h-5`}>
                                            {getPaymentStatusLabel(selectedPayment.paymentStatus)}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Fecha */}
                                <div className="space-y-2">
                                    <span className="text-sm font-medium leading-none text-white">Fecha Subida</span>
                                    <div className="w-full bg-black border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300">
                                        {formatDate(selectedPayment.transferProofUploadedAt || selectedPayment.inicio)}
                                    </div>
                                </div>
                            </div>

                            {/* Sección Imagen */}
                            <div className="space-y-2">
                                <span className="text-sm font-medium leading-none text-white">Comprobante</span>
                                {selectedPayment.transferProofUrl ? (
                                    <div className="bg-black border border-gray-700 rounded-md p-2">
                                        <div className="rounded overflow-hidden border border-gray-800 bg-gray-900/50 flex justify-center mb-2">
                                            <img
                                                src={selectedPayment.transferProofUrl}
                                                alt="Comprobante"
                                                className="max-w-full h-auto max-h-[300px] object-contain"
                                            />
                                        </div>
                                        <a
                                            href={selectedPayment.transferProofUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block"
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full border-gray-700 hover:border-gray-600 text-[#D4AF37] hover:text-[#D4AF37] hover:bg-gray-800"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Abrir imagen completa
                                            </Button>
                                        </a>
                                    </div>
                                ) : (
                                    <div className="w-full bg-black border border-gray-700 rounded-md px-3 py-8 text-sm text-red-400 text-center">
                                        ⚠️ No se encontró la imagen.
                                    </div>
                                )}
                            </div>

                            {/* Footer de Acciones */}
                            <DialogFooter className="gap-2 sm:gap-0 pt-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn-red"
                                >
                                    Cerrar
                                </Button>

                                {selectedPayment.paymentStatus !== 'PAID' ? (
                                    <Button
                                        onClick={() => handleConfirmPayment(selectedPayment.bookingId)}
                                        className="bg-[#9D8EC1] hover:bg-[#9D8EC1]/90"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Confirmar Pago
                                    </Button>
                                ) : (
                                    /* ✅ BOTÓN ACTUALIZADO CON ESTILO DORADO */
                                    <Button
                                        disabled
                                        className="bg-gradient-to-r from-[#D4AF37] to-[#E8C962] text-black border border-[#B5952F] opacity-100 cursor-default shadow-lg shadow-[#D4AF37]/20 font-semibold"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Pago ya confirmado
                                    </Button>
                                )}
                            </DialogFooter>

                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}