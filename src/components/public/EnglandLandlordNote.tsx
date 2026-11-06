/**
 * Plain reciprocal link for the public home and welcome pages.
 * Render it only above the public footer on those two routes.
 * Do not mount it from the shared header, footer, app layout, or any
 * auth, payment, checkout, or account screen.
 */
export function EnglandLandlordLink() {
  return (
    <p className="px-4 pt-2 pb-1 text-center text-sm">
      <a
        href="https://registerprep.vercel.app/"
        className="text-blue-600 underline underline-offset-2 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm"
      >
        For landlords in England
      </a>
    </p>
  );
}
