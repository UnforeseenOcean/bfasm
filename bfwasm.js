const mem = new WebAssembly.Memory({ initial: 1 });
const log = console.log;
const wasmInstance = new WebAssembly.Instance(wasmModule, { env: { mem, log }});

function interpret(code, input = '') {
  const heap8 = new Uint8Array(mem.buffer);

  function strcpy(buf, offs, S) {
    for (let i = 0; i < S.length; i++) {
      buf[offs + i] = S.charCodeAt(i);
    }
    buf[offs + S.length] = 0;
    // Return the end of the string, including null character.
    return offs + S.length + 1;
  }

  // Interpret this section of the heap as a C string...
  function cstring(buf, offs, maxSize = 0x10000) {
    let i = 0, S = '';
    while (i < maxSize) {
      const c = buf[offs + i++];
      if (c === 0)
        break;
      S += String.fromCharCode(c);
    }
    return S;
  }

  // Prepare heap.
  const pCmd = 0x0000;
  const pCmdEnd = strcpy(heap8, pCmd, code);

  const pIn = (pCmdEnd + 7) & ~7;
  const pInEnd = strcpy(heap8, pIn, input);

  const pOut = (pInEnd + 7) & ~7;
  // We give the output buffer a huge size. Way too much.
  const pOutEnd = pOut + 0x1000;

  const pData = (pOutEnd + 7) & ~7;

  const ret = wasmInstance.exports.interpret(pCmd, pOut, pIn, pData);

  if (!ret) {
    throw new Error('bad');
  }

  return cstring(heap8, pOut);
}
console.log(interpret('++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.'));
