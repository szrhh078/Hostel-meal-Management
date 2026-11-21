import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#f8fafc',
      color: '#172033',
      padding: '48px 20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <article style={{
        maxWidth: 850,
        margin: '0 auto',
        background: '#fff',
        padding: '40px',
        borderRadius: 16,
        lineHeight: 1.8,
        boxShadow: '0 4px 24px rgba(0,0,0,.05)'
      }}>
        <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>
          <ArrowLeft size={16} style={{ verticalAlign: 'middle' }} /> Back to HMS Pro
        </a>

        <div style={{ marginTop: 30 }}>
          <ShieldCheck size={38} color="#2563eb" />
          <h1>Privacy Policy</h1>
          <p>HMS Pro – Hostel Meal Management System</p>
          <p><strong>Effective date:</strong> November 22, 2026</p>
        </div>

        <h2>1. Introduction</h2>
        <p>
          HMS Pro is a hostel and shared-accommodation meal management
          platform. This policy explains how we collect, use, store,
          share and protect information when you use our application.
        </p>

        <h2>2. Information We Collect</h2>
        <h3>Google Account Information</h3>
        <p>
          When you sign in using Google, we receive authorized account
          information such as your name, email address, profile picture
          and authentication identifiers, where available.
        </p>
        <p>
          We use this information to authenticate you, create your
          account and display your profile. We do not request access
          to Gmail, Google Drive or Google Contacts through ordinary
          Google sign-in.
        </p>

        <h3>Account and Profile Information</h3>
        <p>
          We may process your display name, email address, profile
          information, account role and hostel membership information.
        </p>

        <h3>Meal and Financial Information</h3>
        <p>
          HMS Pro processes meal counts, meal records, bazar expenses,
          payments, advances, balances and monthly financial reports
          that users or hostel administrators enter into the application.
        </p>

        <h3>Technical Information</h3>
        <p>
          Technical information such as browser and device details,
          IP addresses and diagnostic or access logs may be processed
          by the application and its hosting providers.
        </p>

        <h2>3. How We Use Information</h2>
        <ul>
          <li>Authenticate users and manage accounts.</li>
          <li>Manage hostel and mess memberships.</li>
          <li>Record meals and shared expenses.</li>
          <li>Calculate meal rates, balances and costs.</li>
          <li>Generate monthly reports and PDF statements.</li>
          <li>Maintain application security and troubleshoot issues.</li>
          <li>Respond to support requests and legal obligations.</li>
        </ul>

        <h2>4. Google User Data</h2>
        <p>
          Information received through Google sign-in is used only
          for authentication and related account functionality.
          We do not sell Google user data or use it for targeted
          advertising.
        </p>
        <p>
          Our handling of Google user data follows the Google API
          Services User Data Policy, including its Limited Use
          requirements.
        </p>

        <h2>5. Data Storage and Security</h2>
        <p>
          HMS Pro uses Supabase for authentication and backend database
          services. Account and application information may be stored
          and processed through Supabase infrastructure.
        </p>
        <p>
          We use reasonable technical and organizational safeguards,
          including HTTPS and configured database access controls.
          No internet-based service can guarantee absolute security.
        </p>

        <h2>6. Information Sharing</h2>
        <p>
          We do not sell or rent personal information. Information
          may be processed by service providers necessary to operate
          HMS Pro, including Supabase and our website hosting and
          delivery providers.
        </p>
        <p>
          Depending on application permissions, authorized members
          and hostel administrators may see relevant meal, expense,
          payment and membership records belonging to their hostel.
        </p>
        <p>
          Information may also be disclosed where required by
          applicable law or valid legal process.
        </p>

        <h2>7. Data Retention</h2>
        <p>
          Information is retained as reasonably necessary to provide
          the service, maintain account functionality, preserve relevant
          financial records and comply with applicable legal obligations.
          Information no longer required is subject to appropriate
          deletion or anonymization procedures.
        </p>

        <h2>8. Account and Data Deletion</h2>
        <p>
          Users may request deletion of their HMS Pro accounts and
          associated personal information by contacting our support
          email below. Requests will be reviewed and processed subject
          to applicable legal and legitimate record-retention obligations.
        </p>
        <p>
          Deleting an account may affect access to hostel membership,
          meal history, balances and other application features.
        </p>

        <h2>9. Cookies and Local Storage</h2>
        <p>
          The application may use cookies, browser storage or similar
          technologies for authentication, session management and
          application preferences. Disabling these technologies may
          affect application functionality.
        </p>

        <h2>10. Children's Privacy</h2>
        <p>
          HMS Pro is not intended to knowingly collect personal
          information from children in violation of applicable laws.
        </p>

        <h2>11. Third-Party Services</h2>
        <p>
          HMS Pro relies on external infrastructure and service
          providers. Their handling of information is governed by
          their respective privacy policies and terms.
        </p>

        <h2>12. Policy Updates</h2>
        <p>
          We may update this policy when our application features,
          data practices or legal obligations change. Updated versions
          will be published on this page with a revised effective date.
        </p>

        <h2>13. Contact Us</h2>
        <p>
          For privacy questions or account deletion requests,
          contact:
        </p>
        <p><strong>Application:</strong> HMS Pro</p>
        <p><strong>Website:</strong> https://hms-pro.shop</p>
        <p>
          <strong>Support email:</strong>{' '}
          REPLACE_WITH_YOUR_REAL_SUPPORT_EMAIL
        </p>

        <hr />
        <p style={{ fontSize: 13, color: '#64748b' }}>
          © {new Date().getFullYear()} HMS Pro. All rights reserved.
        </p>
      </article>
    </main>
  );
}
