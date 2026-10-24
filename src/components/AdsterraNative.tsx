/** Native Banner zone 31825903. Official snippet, parsed inside its own iframe. */
const NATIVE_SCRIPT_SRC = 'https://bauval.org/21/5df5a6a46bb57d8615e5aefa3f8cb512';
const NATIVE_CONTAINER_ID = 'container-5df5a6a46bb57d8615e5aefa3f8cb512';

function nativeDocument(): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent;}#${NATIVE_CONTAINER_ID}{width:100%;height:250px;overflow:hidden;}</style></head><body><script async data-cfasync="false" src=${JSON.stringify(NATIVE_SCRIPT_SRC)}></script><div id="${NATIVE_CONTAINER_ID}"></div></body></html>`;
}

/** Fixed slot above the public footer. The creative cannot change the page height. */
export function AdsterraNative() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 728,
        height: 274,
        margin: '2rem auto 0',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <div className="text-xs text-gray-400 mb-2 text-center" style={{ height: 16 }}>
        Advertisement
      </div>
      <iframe
        title="Advertisement"
        srcDoc={nativeDocument()}
        width={728}
        height={250}
        scrolling="no"
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-forms"
        referrerPolicy="strict-origin-when-cross-origin"
        style={{
          width: '100%',
          height: 250,
          border: 0,
          display: 'block',
          overflow: 'hidden',
        }}
      />
    </div>
  );
}
