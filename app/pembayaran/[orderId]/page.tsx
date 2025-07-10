// Lokasi: app/pembayaran/[orderId]/page.tsx

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Copy, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/types/order';
import Image from 'next/image';

// --- BAGIAN DETAIL PEMBAYARAN DIPERBARUI ---
const paymentDetails = {
    bank_transfer: {
        title: "Transfer Bank BCA",
        rekening: "7355211282",
        atasNama: "Ibnu Habib Ridwansyah",
        logo: "/bca.png",
        note: "Bisa transfer melalui bank lain atau e-wallet (ShopeePay, GoPay, DANA, dll) ke rekening BCA ini."
    },
    virtual_account_bca: {
        title: "BCA Virtual Account",
        rekening: "122085135706028",
        atasNama: "ShopeePay (a.n. ibnuhabib017)",
        logo: "/bca.png",
        instructions: {
            "mBanking (m-BCA)": "Pilih m-Transfer > BCA Virtual Account > Masukkan No. Virtual Account di atas > Masukkan nominal > Pastikan nama tertera ShopeePay & username > Masukkan PIN.",
            "iBanking (KlikBCA)": "Pilih Transfer Dana > Transfer ke BCA Virtual Account > Masukkan No. VA di atas > Masukkan nominal > Pastikan nama tertera ShopeePay & username > Masukkan respon KeyBCA."
        }
    },
    virtual_account_bri: {
        title: "BRI Virtual Account",
        rekening: "112085135706028",
        atasNama: "ShopeePay (a.n. ibnuhabib017)",
        logo: "/bri.png",
        instructions: {
            "iBanking": "Pilih Pembayaran > BRIVA > Masukkan No. VA di atas > Masukkan nominal > Pastikan nama & username sesuai > Masukkan password & mToken.",
            "mBanking (BRImo)": "Pilih Dompet Digital > Top Up Baru > Pilih ShopeePay > Masukkan nomor HP (085135706028) > Masukkan nominal > Pastikan data benar > Masukkan PIN."
        }
    },
    virtual_account_bni: {
        title: "BNI Virtual Account",
        rekening: "807085135706028",
        atasNama: "ShopeePay (a.n. ibnuhabib017)",
        logo: "/bni.png",
        instructions: {
            "iBanking": "Pilih Transfer > Virtual Account Billing > Masukkan No. VA di atas > Masukkan nominal > Pastikan nama & username sesuai > Masukkan Kode Otentikasi.",
            "mBanking": "Pilih E-Wallet > ShopeePay > Input Baru > Masukkan No. HP (085135706028) > Masukkan nominal > Masukkan Password Transaksi."
        }
    },
    virtual_account_mandiri: {
        title: "Mandiri Virtual Account",
        rekening: "893085135706028",
        atasNama: "ShopeePay (a.n. ibnuhabib017)",
        logo: "/mandiri.png",
        instructions: {
            "mBanking (Livin')": "Pilih Top up > e-Wallet > ShopeePay > Masukkan No. VA di atas > Masukkan nominal > Pastikan username sesuai > Masukkan PIN."
        }
    },
    shopeepay: {
        title: "Transfer ShopeePay",
        rekening: "085135706028",
        atasNama: "ibnuhabib017",
        logo: "/shopeepay.png",
        instructions: {
            "Panduan": "Buka aplikasi Shopee > Pilih ShopeePay > Transfer > Transfer ke Kontak > Masukkan nomor/username di atas > Masukkan nominal > Transfer Sekarang > Masukkan PIN."
        }
    },
    gopay: {
        title: "Transfer GoPay",
        rekening: "085135706028",
        atasNama: "Ibnu Habib Ridwansyah",
        logo: "/gopay.png",
        instructions: {
            "Via Aplikasi Gojek/GoPay": "Pilih Bayar/Transfer > Cari GoPay > Masukkan nomor HP tujuan > Masukkan nominal > Pilih GoPay sebagai metode bayar > Masukkan PIN.",
            "Scan QRIS GoPay": "Buka aplikasi Gojek/GoPay > Pilih Bayar > Scan kode QR di bawah ini > Masukkan nominal > Bayar > Masukkan PIN."
        },
        qrisImage: "/qris-gopay.png"
    },
    qris: {
        title: "QRIS",
        atasNama: "MP-TOKO KITVERSITY",
        logo: "/qris-logo.png",
        qrisImage: "/qris.png",
        instructions: {
            "Panduan Umum": "1. Buka aplikasi M-Banking atau E-Wallet Anda (GoPay, DANA, ShopeePay, OVO, dll).\n2. Pilih menu Bayar atau Scan QR.\n3. Scan kode QR di atas.\n4. Masukkan jumlah total pembayaran dan selesaikan transaksi."
        },
        note: "Pastikan nama Merchant yang muncul adalah MP-TOKO KITVERSITY sebelum melakukan pembayaran."
    }
};
// --- AKHIR PERUBAHAN ---


const PaymentContent = () => {
    const params = useParams();
    const router = useRouter();
    const orderId = params.orderId as string;
  
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [methodDetails, setMethodDetails] = useState<any>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!orderId) return;
        const fetchOrder = async () => {
          try {
            const response = await fetch(`/api/orders?id=${orderId}`);
            if (!response.ok) throw new Error('Gagal memuat pesanan.');
            const data = await response.json();
            setOrder(data.order);
            setMethodDetails(paymentDetails[data.order.paymentMethod as keyof typeof paymentDetails]);
          } catch (err) {
            console.error(err);
          } finally {
            setIsLoading(false);
          }
        };
        fetchOrder();
    }, [orderId]);

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Berhasil disalin!', description: `${label}: ${text}` });
    };

    if (isLoading || !order || !methodDetails) {
        return <div className="flex justify-center items-center min-h-screen"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container max-w-lg mx-auto px-4">
                <Card className="shadow-lg animate-in fade-in-50">
                    <CardHeader className="text-center p-6 border-b">
                        <CardTitle className="text-2xl">Selesaikan Pembayaran</CardTitle>
                        <CardDescription>Pesanan ID: <span className="font-semibold text-primary">{order.id}</span></CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <Alert className="text-center">
                            <AlertDescription>
                                <div className="text-sm text-gray-600">Total Pembayaran</div>
                                <div className="text-3xl font-bold my-1 tracking-tight">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.totalAmount)}</div>
                            </AlertDescription>
                        </Alert>
                        
                        <div className="text-center p-4 bg-gray-50 rounded-lg flex items-center gap-4">
                            <Image src={methodDetails.logo} alt={methodDetails.title} width={48} height={48} className="object-contain" />
                            <div className="text-left">
                                <h3 className="font-bold text-lg">{methodDetails.title}</h3>
                                {methodDetails.rekening &&
                                    <div className="mt-1 flex items-center gap-2">
                                        <p className="text-lg font-mono text-gray-800">{methodDetails.rekening}</p>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(methodDetails.rekening, "Nomor Tujuan")}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                }
                                {methodDetails.atasNama && <p className="text-sm text-gray-500">a.n. {methodDetails.atasNama}</p>}
                            </div>
                        </div>

                        {methodDetails.qrisImage && (
                             <div className="flex justify-center p-4 bg-white rounded-lg border">
                                <Image src={methodDetails.qrisImage} alt="QRIS Code" width={280} height={280} priority />
                             </div>
                        )}
                        
                        <div>
                            <h4 className="font-semibold mb-2">Panduan Pembayaran:</h4>
                            <Accordion type="single" collapsible className="w-full" defaultValue={Object.keys(methodDetails.instructions || {})[0]}>
                                {methodDetails.instructions && Object.entries(methodDetails.instructions).map(([key, value]) => (
                                    <AccordionItem value={key} key={key}>
                                        <AccordionTrigger>{key}</AccordionTrigger>
                                        <AccordionContent className="text-sm leading-relaxed whitespace-pre-line px-1">
                                            {value as string}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                            {methodDetails.note && <p className="text-xs text-center mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">{methodDetails.note}</p>}
                        </div>

                        <Button onClick={() => router.push(`/terimakasih/${order.id}`)} size="lg" className="w-full font-bold">
                            Saya Sudah Bayar & Lanjut <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>}>
            <PaymentContent />
        </Suspense>
    );
}