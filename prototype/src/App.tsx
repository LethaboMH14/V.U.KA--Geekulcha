import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { DemoProvider, useDemo } from '@/contexts/DemoContext'
import { MemberProvider } from '@/contexts/MemberContext'
import { OnboardingProvider } from '@/contexts/OnboardingContext'
import { PhoneFrame } from '@/components/PhoneFrame'
import { DemoPanel } from '@/components/DemoPanel'
import { ComponentGallery } from '@/pages/ComponentGallery'
import { VigilHome } from '@/pages/VigilHome'
import { MyRecord } from '@/pages/MyRecord'
import { GuardianView } from '@/pages/GuardianView'
import { Welcome } from '@/pages/onboarding/Welcome'
import { SignIn } from '@/pages/onboarding/SignIn'
import { YourName } from '@/pages/onboarding/YourName'
import { PhoneNumber } from '@/pages/onboarding/PhoneNumber'
import { VerifyCode } from '@/pages/onboarding/VerifyCode'
import { Permissions } from '@/pages/onboarding/Permissions'
import { SetPins } from '@/pages/onboarding/SetPins'
import { InviteGuardians } from '@/pages/onboarding/InviteGuardians'
import { Settings } from '@/pages/settings/Settings'
import { Enrol } from '@/pages/guardian/Enrol'
import { Standby } from '@/pages/guardian/Standby'
import { Acknowledged } from '@/pages/guardian/Acknowledged'
import { WebDemoProvider } from '@/pages/web/webDemoContext'
import { VerifyPage } from '@/pages/web/VerifyPage'
import { PanelPage } from '@/pages/web/PanelPage'
import { StagePage } from '@/pages/web/StagePage'

/** Inner shell — reads the off-phone role/location to configure the frame. */
function PhoneApp() {
  const { role } = useDemo()

  if (role === 'guardian') {
    return (
      <PhoneFrame hideNav>
        <Routes>
          <Route path="/guardian/enrol"        element={<Enrol />} />
          <Route path="/guardian/standby"      element={<Standby />} />
          <Route path="/guardian/acknowledged" element={<Acknowledged />} />
          <Route path="*"                      element={<GuardianView />} />
        </Routes>
      </PhoneFrame>
    )
  }

  return (
    <PhoneFrame>
      <Routes>
        <Route path="/"                    element={<VigilHome />} />
        <Route path="/anchor"              element={<MyRecord />} />
        <Route path="/gallery"             element={<ComponentGallery />} />
        <Route path="/settings"            element={<Settings />} />
        <Route path="/welcome"             element={<Welcome />} />
        <Route path="/welcome/sign-in"     element={<SignIn />} />
        <Route path="/welcome/name"        element={<YourName />} />
        <Route path="/welcome/phone"       element={<PhoneNumber />} />
        <Route path="/welcome/verify"      element={<VerifyCode />} />
        <Route path="/welcome/permissions" element={<Permissions />} />
        <Route path="/welcome/pins"        element={<SetPins />} />
        <Route path="/welcome/guardians"   element={<InviteGuardians />} />
        <Route path="/guardian/enrol"      element={<Enrol />} />
        <Route path="/guardian/standby"    element={<Standby />} />
        <Route path="/guardian/acknowledged" element={<Acknowledged />} />
        <Route path="*"                    element={<VigilHome />} />
      </Routes>
    </PhoneFrame>
  )
}

/** Phone + off-phone demo panel — the default (member/guardian/onboarding) view. */
function PhoneAndPanel() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#e7e5df',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '32px 24px',
        gap: 28,
        flexWrap: 'wrap',
      }}
    >
      {/* Phone + neutral build label (build labels live OFF the phone, in grey) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <PhoneApp />
      </div>

      {/* Demo panel — off-phone, never mirrored */}
      <DemoPanel />
    </div>
  )
}

/**
 * Top-level branch: Slice D's desktop web pages (/verify, /panel, /stage)
 * bypass the phone chrome entirely. Everything else keeps the existing
 * phone + demo-panel layout, routed inside PhoneApp as before.
 */
function AppBody() {
  const { pathname } = useLocation()
  if (pathname === '/verify') return <VerifyPage />
  if (pathname === '/panel') return <PanelPage />
  if (pathname === '/stage') return <StagePage />
  return <PhoneAndPanel />
}

export default function App() {
  return (
    <BrowserRouter>
      <DemoProvider>
        <MemberProvider>
          <OnboardingProvider>
            <WebDemoProvider>
              <AppBody />
            </WebDemoProvider>
          </OnboardingProvider>
        </MemberProvider>
      </DemoProvider>
    </BrowserRouter>
  )
}
