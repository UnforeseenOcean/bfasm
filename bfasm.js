(function(exports) {

    function BrainfuckInterpreter(stdlib, foreign, heap) {
        "use asm";

        var heap8 = new stdlib.Uint8Array(heap);

        function interpret(pCmd, pOut, pIn, pData) {
            pCmd = pCmd | 0;
            pOut = pOut | 0;
            pIn = pIn | 0;
            pData = pData | 0;

            var cmd = 0, stackDepth = 0, cmd2 = 0;

            while(1) {
                cmd = heap8[pCmd] | 0;
                pCmd = (pCmd + 1) | 0;
                if ((cmd | 0) == 0) {
                    return 1;
                } else if ((cmd | 0) == 62) { // >
                    pData = (pData + 1) | 0;
                } else if ((cmd | 0) == 60) { // <
                    pData = (pData - 1) | 0;
                } else if ((cmd | 0) == 43) { // +
                    heap8[pData] = ((heap8[pData] | 0) + 1);
                } else if ((cmd | 0) == 45) { // -
                    heap8[pData] = ((heap8[pData] | 0) - 1);
                } else if ((cmd | 0) == 46) { // .
                    heap8[pOut] = heap8[pData];
                    pOut = (pOut + 1) | 0;
                } else if ((cmd | 0) == 44) { // ,
                    heap8[pData] = heap8[pIn];
                    pIn = (pIn + 1) | 0;
                } else if ((cmd | 0) == 91) { // [
                    if ((heap8[pData] | 0) == 0) {
                        // Find matching ]
                        stackDepth = 0;
                        while(1) {
                            cmd2 = heap8[pCmd] | 0;
                            pCmd = (pCmd + 1) | 0;
                            if ((cmd2 | 0) == 0) {
                                // wtf
                                return 0;
                            } else if ((cmd2 | 0) == 91) { // [
                                stackDepth = (stackDepth + 1) | 0;
                            } else if ((cmd2 | 0) == 93) { // ]
                                if ((stackDepth | 0) == 0) {
                                    break;
                                }
                                stackDepth = (stackDepth - 1) | 0;
                            }
                        }
                    }
                } else if ((cmd | 0) == 93) { // ]
                    if ((heap8[pData] | 0) != 0) {
                        // Find matching [
                        stackDepth = 0;
                        pCmd = (pCmd - 1) | 0;
                        while(1) {
                            pCmd = (pCmd - 1) | 0;
                            cmd2 = heap8[pCmd] | 0;
                            if ((cmd2 | 0) == 0) {
                                // wtf
                                return 0;
                            } else if ((cmd2 | 0) == 93) { // ]
                                stackDepth = (stackDepth + 1) | 0;
                            } else if ((cmd2 | 0) == 91) { // [
                                if ((stackDepth | 0) == 0) {
                                    break;
                                }
                                stackDepth = (stackDepth - 1) | 0;
                            }
                        }
                    }
                }
            }
            return 0;
        }

        return {
            interpret: interpret,
        };
    }

    // JS Runtime code.
    function interpret(code, input = '') {
        // I hope the size isn't bigger than this...
        const heap = new ArrayBuffer(0x10000);
        const heap8 = new Uint8Array(heap);

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

        const bf = BrainfuckInterpreter(window, null, heap);
        const ret = bf.interpret(pCmd, pOut, pIn, pData);

        if (!ret) {
            throw new Error('bad');
        }

        return cstring(heap8, pOut);
    }

    // https://en.wikipedia.org/wiki/Brainfuck#Hello_World.21
    console.log(interpret('++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.'));

})(window);
