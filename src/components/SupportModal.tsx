import { Check, Copy, ExternalLink, Smartphone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { ModalShell } from "./ModalShell";

const PIX_CODE =
  "00020126490014BR.GOV.BCB.PIX0111470052348470212ReligioMundi5204000053039865802BR5916Kauan Crema Dias6009SAO PAULO62140510cdnPXAbnWg63044819";
const NUBANK_URL = "https://nubank.com.br/cobrar/18cvy/6a6cf6ad-6522-42b5-aa7d-32bbb73f1efa";

export function SupportModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 3200);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(PIX_CODE);
      setCopied(true);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = PIX_CODE;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const succeeded = document.execCommand("copy");
      textarea.remove();
      setCopied(succeeded);
    }
  };

  return (
    <ModalShell title="APOIAR O RELIGIO MUNDI" onClose={onClose} className="support-modal">
      <div className="support-modal-content">
        <section className="support-intro">
          <p className="eyebrow">ACERVO ABERTO · PESQUISA INDEPENDENTE</p>
          <h3>Ajude este atlas a continuar crescendo.</h3>
          <p className="support-intro-copy">
            Seu apoio contribui para pesquisa, revisão das fontes, infraestrutura e novas formas de
            explorar o acervo. Escolha a opção mais prática para o seu dispositivo.
          </p>
        </section>

        <div className="support-payment-grid">
          <section className="support-qr-panel">
            <div
              className="support-qr-frame"
              role="img"
              aria-label="QR Code para apoiar o RELIGIO MUNDI via Pix"
            >
              <QRCodeSVG
                value={PIX_CODE}
                size={248}
                level="M"
                marginSize={2}
                bgColor="#f3eedf"
                fgColor="#101816"
              />
            </div>
            <h3>Escaneie com o aplicativo do seu banco</h3>
            <p>
              Em um só aparelho, tire um print e use a opção de ler QR Code pela galeria do seu
              banco. Se ela não estiver disponível, copie o código Pix abaixo.
            </p>
          </section>

          <section className="support-actions-panel">
            <div className="support-method">
              <span className="support-method-icon" aria-hidden="true">
                <Copy size={19} />
              </span>
              <div>
                <small>PIX COPIA E COLA</small>
                <strong>Kauan Crema Dias</strong>
              </div>
            </div>
            <code className="support-pix-code">{PIX_CODE}</code>
            <button className="ritual-button support-copy-button" onClick={copyPixCode}>
              {copied ? <Check size={17} /> : <Copy size={17} />}
              {copied ? "Código Pix copiado" : "Copiar código Pix"}
            </button>
            <p className="support-copy-status" role="status" aria-live="polite">
              {copied ? "Agora é só colar na área Pix do seu banco." : ""}
            </p>

            <div className="support-divider" aria-hidden="true">
              <span>OU</span>
            </div>

            <a className="support-bank-link" href={NUBANK_URL} target="_blank" rel="noreferrer">
              <Smartphone size={18} />
              <span>
                <small>ABRIR COBRANÇA DIRETA</small>
                <strong>Continuar pelo Nubank</strong>
              </span>
              <ExternalLink size={16} />
            </a>
            <p className="support-security-note">
              Confira o nome do destinatário antes de confirmar qualquer pagamento.
            </p>
          </section>
        </div>
      </div>
    </ModalShell>
  );
}
