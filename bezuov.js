Array.prototype.insert = function ( index, item ) {
    this.splice( index, 0, item );
};

window.onload = function() {
    const mf = document.getElementById('input');
    mf.addEventListener('change', (ev) => {
        document.getElementById("info").innerHTML = ''
        document.getElementById("")
        dupes = []
        render = []
        
        document.getElementById("rjesenja").innerHTML = ''
        let formula = ev.target.value;

        if (formula.includes('^0') || formula.match(/{ *}/g) != null) {
            let node = document.createElement("p");
            node.setAttribute('id',`error`)
            let textnode = document.createTextNode('Neispravno unjet polinom');
            node.appendChild(textnode);
            document.getElementById("rjesenja").appendChild(node);
            return;
        };
        if (!formula.includes('{')) {
            let clanovi = formula.toLowerCase().replace(/ /g, '').replace(/-/g, '+-').split('+').filter(e => e)
            formula = formula.replace(/\+1x/g, '+x')
            formula = formula.replace(/-1x/g, '-x')
            if (formula[0] == '+') {
                formula = formula.substring(1)
            }
            formula = formula.replace(/(\+|-)0x(\^\d*)?/g,'')
            formula = formula.replace(/\^1(?=\+|-)|\^1$/g,'')
            formula = formula.replace(/x\^/g, 'x^{').replace(/ *- */g,'}-').replace(/ *\+ */g,'}+').replace(/[^\d]}/g,'x')
            console.log(clanovi[clanovi.length-1])
            if (clanovi[clanovi.length-1] != undefined && clanovi[clanovi.length-1].includes('x^')) {
                formula += '}'
            }
            if (formula[0] == '}') {
                formula = formula.substring(1)
            }
        }
        console.log(formula)
        try {
            bezuov(formula.replace(/{|}/g,''))
        }catch(error){}

        console.log(render.length)

        if (render.length == 0) {
            let node = document.createElement("p");
            node.setAttribute('id',`error`)
            let textnode = document.createTextNode('Ovaj polinom se ne može rastaviti preko Bezuove teoreme');
            node.appendChild(textnode);
            document.getElementById("rjesenja").appendChild(node);
        }else {
            try {
                document.getElementById("error").innerHTML = ''
            } catch (error) {}
        }

        render.sort()
        for (const text of render) {
            let node = document.createElement("math-field");
            node.setAttribute('read-only','')
            node.setAttribute('style',"display:inline-block")
            let textnode = document.createTextNode(text);
            node.appendChild(textnode);
            document.getElementById("rjesenja").appendChild(node);
            document.getElementById("rjesenja").appendChild(document.createElement('br'))
        }
    });
}

let dupes = []
let render = []
/**
 * 
 * @param {string} input 
 * @param {string} prev 
 */
function bezuov(input, prev='') {
    /** @type {string[]} */
    let gligs = input;
    let clanovi = gligs.toLowerCase().replace(/ /g, '').replace(/-/g, '+-').replace(/\^1(?=\+|-)|\^1$/g,'').replace(/-0(x\^\d)?|\+0(x\^\d)?/g,'').split('+').filter(e => e).map(e => e.includes('x') ? (e.split('x')[0] == '' ? '1'+e: ( e.split('x')[0] == '-' ? e.replace('-','-1') : e)) : e)
    console.log('--------'+clanovi+'--------')
    let i = 0;
    for (let pow = parseInt(clanovi[0].split('^')[1]); pow > 0; pow--) {
        console.log(clanovi[i],pow)
        if (!(clanovi[i].split('^')[1] == undefined && pow == 1 && clanovi[i].includes('x'))) {
            if (clanovi[i].split('^')[1] != pow) {
                if (pow == 1) {
                    clanovi.insert(i,'0x');
                }else {
                    clanovi.insert(i,'0x^'+pow);
                }
            }
        }
        i++
    }
    console.log('--------'+clanovi+'--------')

    let djelioci = []
    for (let i = 1; i <= Math.abs(parseInt(clanovi[clanovi.length-1])); i++){
        if (Math.abs(parseInt(clanovi[clanovi.length-1])) % i == 0) {
            djelioci.push(i)
            djelioci.push(-i)
        }
    }

    console.log(djelioci)

    /**
     * 
     * @param {string} clan
     */
    function djeljenje(clan) {
        const stepen = parseInt(clan.split('^')[1])-1
        if (stepen == 1) {
            return clan.split('^')[0]
        }else if (isNaN(stepen)) {
            return clan.replace('x','')
        }else {
            return clan.split('^')[0]+'^'+stepen.toString()
        }
    }

    /**
     * 
     * @param {string} rez 
     * @param {number} a 
     */
    function mnozenje(rez, a) {
        if (rez.includes('x')) {
            return parseInt(rez.split('x')[0])*a+'x'+rez.split('x')[1]
        }else {
            return parseInt(rez.split('x')[0])*a+''
        }
    }

    /**
     * 
     * @param {string} clan 
     * @param {string} rez 
     */
    function sabiranje(clan, rez) {
        if (clan.includes('x')) {
            return parseInt(clan.split('x')[0])+parseInt(rez.split('x')[0])+'x'+clan.split('x')[1]
        }else {
            return parseInt(clan.split('x')[0])+parseInt(rez.split('x')[0])
        }
    }

    for (const djelioc of djelioci) {
        let rezultat = ""
        let ostatak = clanovi[0]
        console.log(`<------------<${djelioc}>------------>`)
        for (let i = 0; i < clanovi.length-1; i++) {
            rezultat += (djeljenje(ostatak).includes('-') ? djeljenje(ostatak) : '+'+djeljenje(ostatak))
            ostatak = sabiranje(clanovi[i+1],mnozenje(djeljenje(ostatak), djelioc))
        }
        console.log(rezultat)
        console.log(ostatak)
        if (ostatak == 0 || ostatak == '0x') {
            if (rezultat != 1) {
                rezultat = rezultat.replace(/\+1x/g, '+x')
                rezultat = rezultat.replace(/-1x/g, '-x')
                if (rezultat[0] == '+') {
                    rezultat = rezultat.substring(1)
                }
                rezultat = rezultat.replace(/(\+|-)0x(\^\d*)?/g,'')
                rezultat = rezultat.replace(/x\^/g, 'x^{').replace(/ *- */g,'}-').replace(/ *\+ */g,'}+').replace(/[^\d]}/g,'x')
                if (rezultat[0] == '}') {
                    rezultat = rezultat.substring(1)
                }
                if (djelioc*-1 > 0) {
                    let gege = JSON.stringify(`(${rezultat})(x+${djelioc*-1})${prev}`.split(/\(|\)\(|\)/g).filter(e => e).sort())
                    console.log('GEEEEEEEEEEEEEEEEEEEEEEEEEEE:'+gege)
                    console.log(dupes)
                    if (!(dupes.includes(gege))) {
                        render.push((rezultat.split(/\+|-/g).length > 1) ? `(${rezultat})(x+${djelioc*-1})${prev}` : `${rezultat}(x+${djelioc*-1})${prev}`)
                        dupes.push(gege)
                    }
                    bezuov(rezultat.replace(/{|}/g,''),`(x+${djelioc*-1})${prev}`)
                }else {
                    let gege = JSON.stringify(`(${rezultat})(x${djelioc*-1})${prev}`.split(/\(|\)\(|\)/g).filter(e => e).sort())
                    console.log('GEEEEEEEEEEEEEEEEEEEEEEEEEEE:'+gege)
                    console.log(dupes)
                    if (!(dupes.includes(gege))) {
                        render.push((rezultat.split(/\+|-/g).length > 1) ? `(${rezultat})(x${djelioc*-1})${prev}` : `${rezultat}(x${djelioc*-1})${prev}`)
                        dupes.push(gege)
                    }
                    bezuov(rezultat.replace(/{|}/g,''),`(x${djelioc*-1})${prev}`)
                }
            }
        }
    }
    console.log('DONE')
}
