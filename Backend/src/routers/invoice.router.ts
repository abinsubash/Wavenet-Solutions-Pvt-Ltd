import { Router } from 'express';
import { verifyJWT } from '../middleware/jwt.middleware';
import { InvoiceController } from '../controllers/invoice.controller';
import { InvoiceService } from '../services/invoice.service';
import { InvoiceRepository } from '../repositories/invoice.repository';

const router = Router();
const invoiceRepository = new InvoiceRepository();
const invoiceService = new InvoiceService(invoiceRepository);
const invoiceController = new InvoiceController(invoiceService);

// CRUD routes
router.post('/', verifyJWT, invoiceController.createInvoice);
router.get('/', verifyJWT, invoiceController.getInvoices);
router.get('/all', verifyJWT, invoiceController.getAllInvoices);
router.patch('/:id', verifyJWT, invoiceController.updateInvoice);
router.delete('/:id', verifyJWT, invoiceController.deleteInvoice);

export default router;