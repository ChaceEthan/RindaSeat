// @ts-nocheck
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '../buttons/Button';

export const QRTicket = ({ booking, onDownload, onPrint }) => {
  const qrRef = useRef();

  const handleDownload = () => {
    const existingQr = booking?.qrCode;
    if (existingQr) {
      const link = document.createElement('a');
      link.href = existingQr;
      link.download = `ticket-${booking?.bookingReference || booking?.id}.png`;
      link.click();
      onDownload?.();
      return;
    }
    const canvas = qrRef.current.querySelector('canvas');
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${booking?.id}.png`;
    link.click();
    onDownload?.();
  };

  const handlePrint = () => {
    const canvas = qrRef.current.querySelector('canvas');
    const url = booking?.qrCode || canvas.toDataURL('image/png');
    const printWindow = window.open('', '', 'height=400,width=600');
    printWindow.document.write(`<img src="${url}" />`);
    printWindow.document.close();
    printWindow.print();
    onPrint?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 p-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Your QR Ticket
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Booking: {booking?.bookingReference || booking?.id}
        </p>
      </div>

      {/* QR Code */}
      <div
        ref={qrRef}
        className="bg-white p-4 rounded-lg border-2 border-primary-500"
      >
        {booking?.qrCode ? (
          <img src={booking.qrCode} alt={`QR ticket ${booking?.bookingReference || booking?.id}`} className="w-64 h-64" />
        ) : (
          <QRCodeCanvas
            value={JSON.stringify({
              bookingId: booking?.id,
              tripId: booking?.tripId,
              seats: booking?.seats,
            })}
            size={256}
            level="H"
            includeMargin
          />
        )}
      </div>

      {/* Ticket Details */}
      <div className="w-full space-y-3 text-sm">
        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">Departure:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {booking?.departure}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">Arrival:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {booking?.arrival}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">Seats:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {booking?.seats?.join(', ')}
          </span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-600 dark:text-gray-400">Total:</span>
          <span className="font-bold text-lg text-primary-600">
            {booking?.totalPrice?.toLocaleString()} RWF
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="flex-1"
        >
          Download
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="flex-1"
        >
          Print
        </Button>
      </div>
    </motion.div>
  );
};

export default QRTicket;
