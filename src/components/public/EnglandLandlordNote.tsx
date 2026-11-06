/**
 * Discreet reciprocal note for landlords in England.
 * Render this only from the public home and welcome bodies.
 * Do not mount it from the shared header, footer, app layout, or any
 * auth, payment, checkout, or account screen.
 */
export function EnglandLandlordNote() {
  return (
    <aside
      aria-labelledby="england-landlord-note"
      className="mt-8 max-w-3xl rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
    >
      <p id="england-landlord-note" className="text-sm font-semibold text-gray-900">
        For landlords in England
      </p>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        <a
          href="https://registerprep.vercel.app/"
          className="text-blue-600 underline decoration-blue-600/40 underline-offset-2 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm"
        >
          RegisterPrep
        </a>
        {' offers landlord registration guides and preparation checklists for landlords in England. It is an independent site, separate from LushLands and from government services. This recommendation is not legal advice, a statement that registration is mandatory, or a guarantee of compliance. LushLands remains property management software for landlords and property managers worldwide.'}
      </p>
    </aside>
  );
}
