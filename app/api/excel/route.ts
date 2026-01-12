import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

interface Takim {
  sira: number;
  takim: string;
  oynanan: number;
  galibiyet: number;
  beraberlik: number;
  malubiyet: number;
  atilanGol: number;
  yenilenGol: number;
  averaj: number;
  puan: number;
}

interface Mac {
  hafta: string;
  tarih: string;
  evSahibi: string;
  evGol: number;
  depGol: number;
  deplasman: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { puanTablosu, maclar, ligAdi, sezon } = body as {
      puanTablosu: Takim[];
      maclar: Mac[];
      ligAdi: string;
      sezon: string;
    };

    const wb = XLSX.utils.book_new();

    const puanData = [
      [`PUAN TABLOSU - ${ligAdi} ${sezon}`],
      [],
      ['Sıra', 'Takım', 'O', 'G', 'B', 'M', 'AG', 'YG', 'AV', 'P'],
      ...puanTablosu.map((t) => [
        t.sira,
        t.takim,
        t.oynanan,
        t.galibiyet,
        t.beraberlik,
        t.malubiyet,
        t.atilanGol,
        t.yenilenGol,
        t.averaj,
        t.puan,
      ]),
    ];

    const wsPuan = XLSX.utils.aoa_to_sheet(puanData);

    wsPuan['!cols'] = [
      { wch: 6 },
      { wch: 25 },
      { wch: 5 },
      { wch: 5 },
      { wch: 5 },
      { wch: 5 },
      { wch: 6 },
      { wch: 6 },
      { wch: 6 },
      { wch: 5 },
    ];

    XLSX.utils.book_append_sheet(wb, wsPuan, 'Puan Tablosu');

    const macData = [
      [`MAÇ SONUÇLARI - ${ligAdi} ${sezon}`],
      [],
      ['Hafta', 'Tarih', 'Ev Sahibi', 'Skor', 'Deplasman', 'Sonuç'],
      ...maclar.map((m) => [
        m.hafta,
        m.tarih,
        m.evSahibi,
        `${m.evGol} - ${m.depGol}`,
        m.deplasman,
        m.evGol > m.depGol ? 'Ev Sahibi' : m.evGol < m.depGol ? 'Deplasman' : 'Berabere',
      ]),
    ];

    const wsMac = XLSX.utils.aoa_to_sheet(macData);

    wsMac['!cols'] = [
      { wch: 8 },
      { wch: 12 },
      { wch: 20 },
      { wch: 10 },
      { wch: 20 },
      { wch: 12 },
    ];

    XLSX.utils.book_append_sheet(wb, wsMac, 'Maçlar');

    const toplamGol = maclar.reduce((s, m) => s + m.evGol + m.depGol, 0);
    const evGalibiyet = maclar.filter((m) => m.evGol > m.depGol).length;
    const depGalibiyet = maclar.filter((m) => m.evGol < m.depGol).length;
    const beraberlik = maclar.filter((m) => m.evGol === m.depGol).length;

    const istatData = [
      ['GENEL İSTATİSTİKLER'],
      [],
      ['Toplam Takım', puanTablosu.length],
      ['Toplam Maç', maclar.length],
      ['Toplam Gol', toplamGol],
      ['Maç Başına Gol', maclar.length > 0 ? (toplamGol / maclar.length).toFixed(2) : 0],
      ['Ev Sahibi Galibiyet', evGalibiyet],
      ['Deplasman Galibiyet', depGalibiyet],
      ['Beraberlik', beraberlik],
      [],
      ['EN ÇOK GOL ATAN TAKIMLAR'],
      [],
      ...puanTablosu
        .sort((a, b) => b.atilanGol - a.atilanGol)
        .slice(0, 5)
        .map((t, i) => [i + 1, t.takim, t.atilanGol]),
    ];

    const wsIstat = XLSX.utils.aoa_to_sheet(istatData);

    wsIstat['!cols'] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 10 },
    ];

    XLSX.utils.book_append_sheet(wb, wsIstat, 'İstatistikler');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="puan_tablosu_${ligAdi.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Excel oluşturma hatası:', error);
    return NextResponse.json({ error: 'Excel oluşturma hatası' }, { status: 500 });
  }
}
