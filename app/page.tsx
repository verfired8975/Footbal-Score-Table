'use client';

import { useState, useEffect } from 'react';

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

const ligler = [
  { id: 'super-lig', name: 'Süper Lig' },
  { id: 'champions-league', name: 'Şampiyonlar Ligi' },
  { id: 'europa-league', name: 'Avrupa Ligi' },
  { id: 'premier-lig', name: 'Premier Lig' },
  { id: 'la-liga', name: 'La Liga' },
  { id: 'serie-a', name: 'Serie A' },
  { id: 'bundesliga', name: 'Bundesliga' },
  { id: 'ligue-1', name: 'Ligue 1' },
  { id: 'eredivisie', name: 'Eredivisie' },
  { id: 'liga-portugal', name: 'Liga Portugal' },
];

export default function Home() {
  const [lig, setLig] = useState('super-lig');
  const [tablo, setTablo] = useState<Takim[]>([]);
  const [loading, setLoading] = useState(true);
  const [tarih, setTarih] = useState('');

  useEffect(() => {
    veriCek();
    const interval = setInterval(veriCek, 300000);
    return () => clearInterval(interval);
  }, []);

  async function veriCek(seciliLig?: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/standings?league=${seciliLig || lig}`);
      const data = await res.json();
      if (data.data) {
        setTablo(data.data);
        setTarih(new Date().toLocaleString('tr-TR'));
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  }

  function ligSec(id: string) {
    setLig(id);
    veriCek(id);
  }

  async function excelIndir() {
    const res = await fetch('/api/excel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        puanTablosu: tablo,
        maclar: [],
        ligAdi: ligler.find(l => l.id === lig)?.name,
        sezon: '2024-2025'
      }),
    });
    if (res.ok) {
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `puan_tablosu.xlsx`;
      a.click();
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a2e', color: '#fff', padding: 20 }}>

      <h1 style={{ textAlign: 'center', marginBottom: 30 }}>Futbol Puan Tablosu</h1>

      <div style={{ background: '#16213e', padding: 20, borderRadius: 10, marginBottom: 20 }}>
        <p style={{ marginBottom: 10 }}>Lig Seç:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {ligler.map(l => (
            <button
              key={l.id}
              onClick={() => ligSec(l.id)}
              style={{
                padding: '10px 15px',
                border: 'none',
                borderRadius: 5,
                cursor: 'pointer',
                background: lig === l.id ? '#e94560' : '#0f3460',
                color: '#fff'
              }}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
        <h2>{ligler.find(l => l.id === lig)?.name}</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ color: '#888', fontSize: 12 }}>{tarih}</span>
          <button onClick={() => veriCek()} style={{ padding: '8px 15px', background: '#0f3460', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer' }}>
            {loading ? 'Yükleniyor...' : 'Yenile'}
          </button>
          <button onClick={excelIndir} style={{ padding: '8px 15px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer' }}>
            Excel
          </button>
        </div>
      </div>

      <div style={{ background: '#16213e', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0f3460' }}>
              <th style={{ padding: 12 }}>#</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Takım</th>
              <th style={{ padding: 12 }}>O</th>
              <th style={{ padding: 12 }}>G</th>
              <th style={{ padding: 12 }}>B</th>
              <th style={{ padding: 12 }}>M</th>
              <th style={{ padding: 12 }}>AG</th>
              <th style={{ padding: 12 }}>YG</th>
              <th style={{ padding: 12 }}>AV</th>
              <th style={{ padding: 12 }}>P</th>
            </tr>
          </thead>
          <tbody>
            {tablo.map((t, i) => (
              <tr key={t.takim} style={{ background: i % 2 === 0 ? '#1a1a2e' : '#16213e', borderBottom: '1px solid #0f3460' }}>
                <td style={{ padding: 10, textAlign: 'center', color: i < 4 ? '#4ade80' : i >= tablo.length - 3 ? '#f87171' : '#fff' }}>{t.sira}</td>
                <td style={{ padding: 10 }}>{t.takim}</td>
                <td style={{ padding: 10, textAlign: 'center', color: '#888' }}>{t.oynanan}</td>
                <td style={{ padding: 10, textAlign: 'center', color: '#4ade80' }}>{t.galibiyet}</td>
                <td style={{ padding: 10, textAlign: 'center', color: '#fbbf24' }}>{t.beraberlik}</td>
                <td style={{ padding: 10, textAlign: 'center', color: '#f87171' }}>{t.malubiyet}</td>
                <td style={{ padding: 10, textAlign: 'center', color: '#888' }}>{t.atilanGol}</td>
                <td style={{ padding: 10, textAlign: 'center', color: '#888' }}>{t.yenilenGol}</td>
                <td style={{ padding: 10, textAlign: 'center', color: t.averaj > 0 ? '#4ade80' : t.averaj < 0 ? '#f87171' : '#888' }}>{t.averaj > 0 ? '+' : ''}{t.averaj}</td>
                <td style={{ padding: 10, textAlign: 'center', fontWeight: 'bold' }}>{t.puan}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {tablo.length === 0 && <p style={{ padding: 40, textAlign: 'center', color: '#888' }}>{loading ? 'Yükleniyor...' : 'Veri yok'}</p>}
      </div>

      <div style={{ marginTop: 20, fontSize: 12, color: '#888' }}>
        <span style={{ marginRight: 20 }}><span style={{ color: '#4ade80' }}>●</span> Şampiyonlar Ligi</span>
        <span><span style={{ color: '#f87171' }}>●</span> Küme düşme</span>
      </div>

    </div>
  );
}
