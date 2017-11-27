(module
    (import "env" "mem" (memory $mem 1))
    (import "env" "log" (func $log (param i32)))
    (func $interpret
        (param $pCmd i32) (param $pOut i32) (param $pIn i32) (param $pData i32)
        (result i32)

        (local $cmd i32)
        (local $stackDepth i32)
        (local $cmd2 i32)

        loop $main

        ;; cmd = heap8[pCmd];
        get_local $pCmd
        i32.load8_u
        set_local $cmd

        ;; pCmd = pCmd + 1;
        get_local $pCmd
        i32.const 1
        i32.add
        set_local $pCmd

        ;; if (cmd == 0)
        get_local $cmd
        i32.const 0
        i32.eq
        if
            i32.const 1
            return
        end

        ;; if (cmd == '>')
        get_local $cmd
        i32.const 62 ;; >
        i32.eq
        if
            ;; pData = pData + 1;
            get_local $pData
            i32.const 1
            i32.add
            set_local $pData
            ;; continue;
            br $main
        end

        ;; if (cmd == '<')
        get_local $cmd
        i32.const 60 ;; <
        i32.eq
        if
            ;; pData = pData - 1;
            get_local $pData
            i32.const 1
            i32.sub
            set_local $pData
            ;; continue;
            br $main
        end

        ;; if (cmd == '+')
        get_local $cmd
        i32.const 43 ;; +
        i32.eq
        if
            ;; heap8[pData] = heap8[pData] + 1;
            get_local $pData
            get_local $pData
            i32.load8_u
            i32.const 1
            i32.add
            i32.store8
            ;; continue;
            br $main
        end

        ;; if (cmd == '-')
        get_local $cmd
        i32.const 45 ;; -
        i32.eq
        if
            ;; heap8[pData] = heap8[pData] - 1;
            get_local $pData
            get_local $pData
            i32.load8_u
            i32.const 1
            i32.sub
            i32.store8
            ;; continue;
            br $main
        end

        ;; if (cmd == '.')
        get_local $cmd
        i32.const 46 ;; .
        i32.eq
        if
            ;; heap8[pOut] = heap8[pData];
            get_local $pOut
            get_local $pData
            i32.load8_u
            i32.store8

            ;; pOut = pOut + 1;
            get_local $pOut
            i32.const 1
            i32.add
            set_local $pOut

            ;; continue;
            br $main
        end

        ;; if (cmd == ',')
        get_local $cmd
        i32.const 44 ;; ,
        i32.eq
        if
            ;; heap8[pData] = heap8[pIn];
            get_local $pData
            get_local $pIn
            i32.load8_u
            i32.store8

            ;; pIn = pIn + 1;
            get_local $pIn
            i32.const 1
            i32.add
            set_local $pIn

            ;; continue;
            br $main
        end

        ;; if (cmd == '[')
        get_local $cmd
        i32.const 91 ;; [
        i32.eq
        if
            ;; if (heap8[pData] == 0)
            get_local $pData
            i32.load8_u
            i32.eqz
            if
                ;; Find matching ]

                ;; stackDepth = 0;
                i32.const 0
                set_local $stackDepth

                loop $search
                    ;; cmd2 = heap8[pCmd];
                    get_local $pCmd
                    i32.load8_u
                    set_local $cmd2

                    ;; pCmd = pCmd + 1;
                    get_local $pCmd
                    i32.const 1
                    i32.add
                    set_local $pCmd

                    ;; if (cmd2 == 0) return 0;
                    get_local $cmd2
                    i32.eqz
                    if
                        i32.const 0
                        return
                    end

                    ;; if (cmd2 == '[')
                    get_local $cmd2
                    i32.const 91 ;; [
                    i32.eq
                    if
                        ;; stackDepth++;
                        get_local $stackDepth
                        i32.const 1
                        i32.add
                        set_local $stackDepth
                        ;; continue;
                        br $search
                    end

                    ;; if (cmd2 == ']')
                    get_local $cmd2
                    i32.const 93 ;; ]
                    i32.eq
                    if
                        ;; if (stackDepth == 0)
                        get_local $stackDepth
                        i32.eqz
                        ;; continue main;
                        br_if $main

                        ;; stackDepth = stackDepth - 1;
                        get_local $stackDepth
                        i32.const 1
                        i32.sub
                        set_local $stackDepth
                        ;; continue;
                        br $search
                    end

                    br $search
                end
            end
        end

        ;; if (cmd == ']')
        get_local $cmd
        i32.const 93 ;; ]
        i32.eq
        if
            ;; if (heap8[pData] != 0)
            get_local $pData
            i32.load8_u
            i32.eqz
            i32.eqz ;; negate
            if
                ;; Find matching [

                ;; stackDepth = 0;
                i32.const 0
                set_local $stackDepth

                ;; pCmd = pCmd - 1;
                get_local $pCmd
                i32.const 1
                i32.sub
                set_local $pCmd

                loop $search
                    ;; pCmd = pCmd - 1;
                    get_local $pCmd
                    i32.const 1
                    i32.sub
                    set_local $pCmd

                    ;; cmd2 = heap8[pCmd];
                    get_local $pCmd
                    i32.load8_u
                    set_local $cmd2

                    ;; if (cmd2 == 0) return 0;
                    get_local $cmd2
                    i32.eqz
                    if
                        i32.const 0
                        return
                    end

                    ;; if (cmd2 == ']')
                    get_local $cmd2
                    i32.const 93 ;; ]
                    i32.eq
                    if
                        ;; stackDepth++;
                        get_local $stackDepth
                        i32.const 1
                        i32.add
                        set_local $stackDepth
                        ;; continue;
                        br $search
                    end

                    ;; if (cmd2 == '[')
                    get_local $cmd2
                    i32.const 91 ;; [
                    i32.eq
                    if
                        ;; if (stackDepth == 0)
                        get_local $stackDepth
                        i32.eqz
                        ;; continue main;
                        br_if $main

                        ;; stackDepth = stackDepth - 1;
                        get_local $stackDepth
                        i32.const 1
                        i32.sub
                        set_local $stackDepth
                        ;; continue;
                        br $search
                    end

                    br $search
                end
            end
        end

        br $main
        end

        ;; Should be unreachable?
        i32.const 0
        return
    )
    (export "interpret" (func $interpret))
)
