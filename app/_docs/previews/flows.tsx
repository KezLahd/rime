"use client";

import { useCallback, useState } from "react";
import { AuthCard, AuthLayout } from "@/components/shell/AuthCard";
import {
  Button,
  Checkbox,
  Field,
  IconCheckCircle,
  IconLock,
  IconShield,
  Modal,
  OtpInput,
  SegmentedControl,
  TextInput,
} from "@/components/ui";
import styles from "./Flows.module.css";

// Two composed flows used by the Modal and AuthCard pages and by /patterns:
// terms with a scroll-gated accept, and a multi-factor sign-in.

// ── Terms with a scroll-gated accept ─────────────────────────────────────

const TERMS = [
  "These terms cover your use of the workspace and every project in it.",
  "Each member keeps their sign-in to themselves and turns on multi-factor authentication.",
  "Project files are stored only in the shared drive, never on personal devices.",
  "Client data is removed within 30 days of a project closing.",
  "Invoices are issued monthly and are due within 14 days.",
  "Either side can end the agreement with 30 days' written notice.",
  "We may update these terms; you will be asked to accept any change before it applies.",
  "Questions about these terms go to the workspace owner.",
  "These terms are governed by the laws where the workspace owner is registered.",
  "By accepting, you confirm you have read every section above.",
].map((t, i) => (
  <p key={i}>
    <strong>{i + 1}.</strong> {t}
  </p>
));

/**
 * The accept stays disabled until the body has been scrolled to its end.
 * Modal's onScrollEnd comes from useScrollEdges: the same passive listener
 * that clears data-more on the panel when there is nothing left below.
 */
function TermsModalBody({ inline, open, onClose }: { inline?: boolean; open: boolean; onClose: () => void }) {
  const [read, setRead] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const onEnd = useCallback(() => setRead(true), []);
  return (
    <Modal
      inline={inline}
      open={open}
      onClose={onClose}
      size="lg"
      title="Workspace terms"
      description="Read to the end to accept. The button unlocks once you reach the last section."
      onScrollEnd={onEnd}
      className={inline ? styles.inlineTerms : styles.terms}
      footerStart={
        read ? (
          <span className={styles.readNote} role="status">
            <IconCheckCircle size={15} /> You have reached the end
          </span>
        ) : (
          <span className={styles.hint} role="status" id="terms-hint">
            Scroll to the end to accept
          </span>
        )
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Not now
          </Button>
          <Button
            disabled={!read || accepted}
            aria-describedby={read ? undefined : "terms-hint"}
            onClick={() => {
              setAccepted(true);
              if (!inline) window.setTimeout(onClose, 400);
            }}
          >
            {accepted ? "Accepted" : "Accept terms"}
          </Button>
        </>
      }
    >
      {TERMS}
    </Modal>
  );
}

/** The live example: open it, scroll, and watch Accept unlock. */
export function TermsGated() {
  const [open, setOpen] = useState(false);
  const [round, setRound] = useState(0);
  return (
    <>
      <Button
        variant="secondary"
        onClick={() => {
          setRound((r) => r + 1);
          setOpen(true);
        }}
      >
        Review the terms
      </Button>
      {/* Re-keyed per opening, so the gate locks again each time. */}
      <TermsModalBody key={round} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/** The same dialog open in place, for /patterns: scroll its body. */
export function TermsGatedInline() {
  return (
    <div className={styles.field}>
      <TermsModalBody inline open onClose={() => {}} />
    </div>
  );
}

export const TERMS_GATED_CODE = `const [read, setRead] = useState(false);
const onEnd = useCallback(() => setRead(true), []);

<Modal
  open={open}
  onClose={close}
  size="lg"
  title="Workspace terms"
  onScrollEnd={onEnd} // from useScrollEdges: fires when data-more clears
  footerStart={read ? <span role="status">You have reached the end</span> : <span role="status" id="terms-hint">Scroll to the end to accept</span>}
  footer={
    <>
      <Button variant="secondary" onClick={close}>Not now</Button>
      <Button disabled={!read} aria-describedby={read ? undefined : "terms-hint"} onClick={accept}>Accept terms</Button>
    </>
  }
>
  {terms}
</Modal>

// Your own scroller: useScrollEdges(bodyRef, { target: panelRef, onEnd: () => setRead(true) });`;

// ── Sign-in with multi-factor authentication ─────────────────────────────

type Step = "password" | "code" | "setup";

function BrandMark({ inverse }: { inverse?: boolean }) {
  return (
    <span className={inverse ? `${styles.mark} ${styles.markInverse}` : styles.mark}>
      <span className={styles.markGlyph} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18 12 5l8 13" />
          <path d="M8 13h8" />
        </svg>
      </span>
      Acme
    </span>
  );
}

/** A stand-in QR code: a fixed pattern, drawn, never scannable. */
function QrPlaceholder() {
  const n = 21;
  const cells: Array<[number, number]> = [];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const finder = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
      if (finder) {
        const fx = x >= n - 7 ? x - (n - 7) : x;
        const fy = y >= n - 7 ? y - (n - 7) : y;
        const ring = fx === 0 || fx === 6 || fy === 0 || fy === 6;
        const core = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4;
        if (ring || core) cells.push([x, y]);
      } else if (((x * 7 + y * 13 + x * y) % 5) < 2) cells.push([x, y]);
    }
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} className={styles.qr} role="img" aria-label="QR code for your authenticator app">
      <rect x="-2" y="-2" width={n + 4} height={n + 4} fill="#ffffff" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#14161d" />
      ))}
    </svg>
  );
}

function SignInCard({ step, onStep }: { step: Step; onStep: (s: Step) => void }) {
  const [code, setCode] = useState("");
  const [setupCode, setSetupCode] = useState("");
  if (step === "password") {
    return (
      <AuthCard
        icon={<IconLock size={22} />}
        title="Sign in"
        subtitle="Use your work email. You will confirm it is you with your authenticator next."
      >
        <Field label="Work email">
          <TextInput type="email" autoComplete="username" defaultValue="jane@acme.example" />
        </Field>
        <Field label="Password">
          <TextInput type="password" revealable autoComplete="current-password" defaultValue="correct horse" />
        </Field>
        <Checkbox label="Keep me signed in on this device" />
        <Button size="lg" fullWidth onClick={() => onStep("code")}>
          Continue
        </Button>
      </AuthCard>
    );
  }
  if (step === "code") {
    return (
      <AuthCard
        icon={<IconShield size={22} />}
        title="Enter your code"
        subtitle="Open your authenticator app and enter the 6-digit code for Acme."
        back={{ href: "#sign-in", label: "Use a different account" }}
      >
        <div className={styles.otp}>
          <OtpInput aria-label="Authentication code" value={code} onChange={setCode} />
        </div>
        <Button size="lg" fullWidth disabled={code.length < 6}>
          Verify
        </Button>
        <p className={styles.alt}>
          Lost your device?{" "}
          <button type="button" className={styles.link} onClick={() => onStep("setup")}>
            Set up a new authenticator
          </button>
        </p>
      </AuthCard>
    );
  }
  return (
    <AuthCard
      width="md"
      icon={<IconShield size={22} />}
      title="Set up your authenticator"
      subtitle="Scan the code with an authenticator app, then enter the 6-digit code it shows."
      back={{ href: "#sign-in", label: "Back to sign in" }}
    >
      <div className={styles.setup}>
        <QrPlaceholder />
        <div className={styles.setupSide}>
          <p className={styles.setupStep}>
            <strong>1.</strong> Install an authenticator app on your phone.
          </p>
          <p className={styles.setupStep}>
            <strong>2.</strong> Scan the QR code, or enter this key:
          </p>
          <code className={styles.secret}>JBSW Y3DP EHPK 3PXP</code>
          <p className={styles.setupStep}>
            <strong>3.</strong> Enter the code from the app.
          </p>
        </div>
      </div>
      <div className={styles.otp}>
        <OtpInput aria-label="Code from your authenticator app" value={setupCode} onChange={setSetupCode} />
      </div>
      <Button size="lg" fullWidth disabled={setupCode.length < 6}>
        Turn on two-step sign-in
      </Button>
    </AuthCard>
  );
}

/** The whole page: brand bar, the card centred, the security note in the footer. */
export function SignInFlow({ initial = "password", switcher = true }: { initial?: Step; switcher?: boolean }) {
  const [step, setStep] = useState<Step>(initial);
  return (
    <div className={styles.signIn}>
      {switcher ? (
        <div className={styles.switcher}>
          <SegmentedControl
            aria-label="Sign-in step"
            size="sm"
            value={step}
            onChange={setStep}
            options={[
              { value: "password", label: "Password" },
              { value: "code", label: "MFA code" },
              { value: "setup", label: "Authenticator setup" },
            ]}
          />
        </div>
      ) : null}
      <div className={styles.authFrame}>
        <AuthLayout
          contained
          header={
            <>
              <BrandMark inverse />
              <a className={styles.help} href="#sign-in">
                Need help?
              </a>
            </>
          }
          footer={
            <>
              <IconShield size={14} />
              Protected by multi-factor authentication. Acme never asks for your code by email or phone.
            </>
          }
        >
          <SignInCard step={step} onStep={setStep} />
        </AuthLayout>
      </div>
    </div>
  );
}

export const SIGN_IN_CODE = `<AuthLayout
  header={<Logo />}
  footer={<><IconShield size={14} /> Protected by multi-factor authentication.</>}
>
  {step === "password" ? (
    <AuthCard icon={<IconLock size={22} />} title="Sign in" subtitle="Use your work email.">
      <Field label="Work email"><TextInput type="email" autoComplete="username" /></Field>
      <Field label="Password"><TextInput type="password" revealable autoComplete="current-password" /></Field>
      <Button size="lg" fullWidth onClick={next}>Continue</Button>
    </AuthCard>
  ) : step === "code" ? (
    <AuthCard icon={<IconShield size={22} />} title="Enter your code" subtitle="Open your authenticator app.">
      <OtpInput aria-label="Authentication code" value={code} onChange={setCode} onComplete={verify} />
      <Button size="lg" fullWidth disabled={code.length < 6}>Verify</Button>
    </AuthCard>
  ) : (
    <AuthCard width="md" icon={<IconShield size={22} />} title="Set up your authenticator">
      <QrCode value={otpauthUrl} />  {/* your QR renderer */}
      <code>{secret}</code>
      <OtpInput aria-label="Code from your authenticator app" value={code} onChange={setCode} />
      <Button size="lg" fullWidth>Turn on two-step sign-in</Button>
    </AuthCard>
  )}
</AuthLayout>`;
