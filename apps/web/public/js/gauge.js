class Gauge {
    constructor(parentId, height) {
        this.parent = document.getElementById(parentId);
        this.holder = null;
        this.parts = [];
        this.height = height;
        this.creat()
        this.setDegree(0);
    }
    creat() {
        let holder = document.createElement('div');
        this.parent.append(holder);
        holder.style.height = this.height + 'px';
        holder.style.width = this.height / 8 / 3 + 'px';
        holder.classList.add('d-flex', 'flex-column');
        holder.style.cssText += `
   -moz-box-shadow:     rgb(0 0 0 / 42%) 0px 0px 7px inset;
   -webkit-box-shadow:  rgb(0 0 0 / 42%) 0px 0px 7px inset;
   box-shadow:          rgb(0 0 0 / 42%) 0px 0px 7px inset;
    border-top: 2px solid #020202d1;
     border-bottom: 2px solid #020202d1;
`;
        for (let i = 0; i < 800; i++) {
            let chiled = document.createElement('span');
            this.parts[i] = chiled;
            holder.append(chiled);
            // chiled.classList.add('bg-danger')
            chiled.style.height = this.height / 800 + 'px';
            chiled.appendChild(document.createTextNode(" "));
            if (i > 0 && i % 100 == 0) {
                chiled.style.cssText += `
                border-top: 2px solid #020202d1;
                `;
            }
            if (i > 398 && i < 402) {
                chiled.style.cssText += `
                border-top: 2px solid rgb(86 177 50);
                `;
            }
        }
        this.holder = holder;
    }
    setDegree(degree) {
        for (let i = 0; i < 799; i++) {
            this.parts[i].style.backgroundColor = '';

        }
        let d = 400 - degree;
        if (d < 0) d = 0;
        if (d > 799) d = 799;
        for (let i = 0; i < d; i++) {
            this.parts[i].style.cssText += `
                background-color:rgb(53 53 53 / 57%);
                `;

        }
    }
    display(can) {
        if (can) this.holder.classList.remove('d-none');
        if (!can) this.holder.classList.add('d-none');
    }
}