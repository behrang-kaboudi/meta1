let pgn = {
    Fen: class {
        constructor(str) {
            var parts = str.split(' ');
            this.strFen = str;
            this.position = parts[0];
            this.side = parts[1];
            this.castling = parts[2];
            this.enp = parts[3];
            this.capOrPawnCounter = parts[4];
            this.moves = parts[5];
        }
        getFen() {
            return this.position + ' ' + this.side + ' ' + this.castling + ' ' + this.enp + ' ' + this.capOrPawnCounter + ' ' + this.moves;
        }
    },
    Comment: class {
        constructor(text, index) {
            this.comment = text;
            this.index = index
        }
        static commentWord = 'commmmm-';
        static exComents(strPgn) {
            let comments = [];
            let commentCounter = 0;
            while (strPgn.includes('}')) {
                let openIndex = strPgn.indexOf('{');
                let closeIndex = strPgn.indexOf('}');
                let comment = strPgn.substring(openIndex, closeIndex + 1);
                comments.push(new pgn.Comment(comment, commentCounter));
                strPgn = strPgn.replace(comment, " " + pgn.Comment.commentWord + commentCounter + " ");
                commentCounter++;
            }
            return {
                strPgn,
                comments
            };
        }
        static arrToString(arr) {
            let str = '';
            arr.forEach(comment => {
                str += comment.comment;
            });
            return str;
        }
    },
    Variant: class {
        constructor() {
            this.moves = [];
            this.index = 0;
        }
        setMoveParents() {
            for (let i = 1; i < this.moves.length; i++) {
                this.moves[i].parentMove = this.moves[i - 1]
            }
        }
        setChildren() {
            for (let i = 0; i < this.moves.length - 1; i++) {
                this._setChildren(this.moves[i], this.moves[i + 1])
            }
            // if (this.moves.length > 0) this._setChildren(this.moves[0].parentMove, this.moves[0])
        }
        _setChildren(move, child) {
            if (!move.ans[0]) {
                move.ans.push(child);
                return;
            }
            let preInsertedMove = move.ans.find(m => m.word == child.word);
            if (!preInsertedMove) {
                move.ans.push(child);
            }
        }
        toPartString() {
            let str = [];
            for (let i = this.moves.length - 1; i > 0; i--) {
                const move = this.moves[i];
                if (move.parentMove.ans.length > 1 && move.parentMove.ans[0].moveObj.san == move.moveObj.san) {
                    for (let i = 0; i < move.parentMove.ans.length - 1; i++) {
                        str.push('xxxx')
                    }
                }
                // for creat ne
                str.push(move.toString());
                if (move.parentMove.ans[0].moveObj.san != move.moveObj.san) break;
            }
            str.reverse();

            return str.join(' ');
        }
        toPartHtml() {
            let str = [];
            for (let i = this.moves.length - 1; i > 0; i--) {
                const move = this.moves[i];
                if (move.parentMove.ans.length > 1 && move.parentMove.ans[0].moveObj.san == move.moveObj.san) {
                    for (let i = 0; i < move.parentMove.ans.length - 1; i++) {
                        str.push('xxxx')
                    }
                }

                str.push(move.toHtml());
                if (move.parentMove.ans[0].moveObj.san != move.moveObj.san) break;
            }
            str.reverse();
            return str.join(' ');
        }
    },
    Move: class {
        constructor(word) {
            this.word = word; // used for creat pgn
            this.endFenObj = this.moveObj = {}; // nextMove startFen Obj
            this.parentMove = null;
            // this.varIndex = 0;
            this.moveIndex = 0;
            this.preComments = [];
            this.afterComments = [];
            this.ans = [];
            this.signs = [];
        }
        static isMove(word) {
            if (word.includes('+') || word.includes('#')) return true;
            if (word.search(/\d(?=.)/) > -1) {
                return false;
            }

            if (word.includes(pgn.Comment.commentWord) || word.includes('$')) return false;
            if (word.length < 2) return false;
            return true;
        }

        getStrNumMove() {
            if (this.moveObj.color == 'w') {
                return this.parentMove.endFenObj.moves + '. ';
            }
            if (!this.isMoveFirstChiled()) return this.parentMove.endFenObj.moves + '... ';
            return '';

        }
        isMoveFirstChiled() {
            if (this.parentMove.ans.length > 1 && this.parentMove.ans[0].moveObj.san != this.moveObj.san) return false;
            return true;
        }
        toString() {
            let str = "";
            if (this.preComments[0]) {
                str += pgn.Comment.arrToString(this.preComments) + ' ';
            }
            str += this.getStrNumMove();
            str += this.moveObj.san;

            if (this.afterComments[0]) {
                str += ' ' + pgn.Comment.arrToString(this.afterComments);
            }
            return str;

        }
        toHtml() {
            let obj = {
                fen: this.endFenObj.strFen,
                varIndex: this.varIndex,
                moveIndex: this.moveIndex
            }
            let str = "";
            str += '<span>';
            str += this.getStrNumMove();
            str += '</span>'

            str += `<span varIndex='${obj.varIndex}' moveIndex = '${obj.moveIndex}'  onclick='setMove(${JSON.stringify(obj)})' class='pointer'>`
            str += this.moveObj.san;
            str += '</span>'
            return str;

        }

    },
    Pgn: class {
        constructor(pgnStr) {
            // console.log('', pgnStr);
            this.strPgn = pgnStr;
            this.comments = [];
            this.preFirstMove = new pgn.Move('');
            this.header = {};
            this.allMoves = [];
            this.varMatris = [];
            this.creat();
        }
        static setFreshString(str) {
                let fresh = str.replace(/\n+|\r+/g, ' ');
                fresh = fresh.replace(/\s+/g, ' ');
                fresh = fresh.trim();
                return fresh
            }
            // api
        creat() {
            this.creatComentArray();
            this.setHeader();
            this.setPrefirstMove()
            this.strPgn = pgn.Pgn.setFreshString(this.strPgn);
            this.exVariants();

        }
        putMove(moveObj, moveIndex, varIndex) {
            let currentM = new pgn.Move();
            currentM.parentMove = this.allMoves.find(m => m.moveIndex == moveIndex && m.varIndex == varIndex) || this.preFirstMove;
            let chess = new Chess(currentM.parentMove.endFenObj.strFen);
            currentM.moveObj = chess.move({ from: moveObj.sq1.name, to: moveObj.sq2.name })
            console.log('', currentM);
            if (currentM.parentMove.ans[0]) {
                let hadChiled = currentM.parentMove.ans.find(m => m.moveObj.san == currentM.moveObj.san);
                if (hadChiled) return hadChiled;
            }
            // 

            currentM.endFenObj = new pgn.Fen(chess.fen());


            if (currentM.parentMove.ans.length == 0 || !currentM.parentMove.ans[0]) {
                currentM.parentMove.ans[0] = currentM;
                currentM.moveIndex = currentM.parentMove.moveIndex + 1;
                currentM.varIndex = currentM.parentMove.varIndex;
                this.varMatris[currentM.parentMove.varIndex].moves.push(currentM);
            } else {
                currentM.parentMove.ans.push(currentM);
                let bigBrotherMove = currentM.parentMove.ans[currentM.parentMove.ans.length - 2];
                console.log('bigBrotherMove', bigBrotherMove.varIndex);
                // creat newVar
                let oneVar = new pgn.Variant();
                // put pre same moves
                for (let i = 0; i < currentM.parentMove.moveIndex + 1; i++) {
                    oneVar.moves[i] = this.varMatris[currentM.parentMove.varIndex].moves[i];
                }
                oneVar.moves.push(currentM)
                if (currentM.parentMove.ans.length > 2) {
                    let newVarMatris = this.varMatris.slice(0, bigBrotherMove.varIndex);
                    newVarMatris.push(oneVar);
                    newVarMatris = newVarMatris.concat(this.varMatris.slice(bigBrotherMove.varIndex))


                    this.varMatris = newVarMatris;
                    // console.log('main', this.varMatris);
                } else {
                    console.log('slice', this.varMatris.slice());
                    // let newVarMatris = [];
                    // newVarMatris.push(this.varMatris[0]);
                    // newVarMatris.push(oneVar);
                    // newVarMatris = newVarMatris.concat(this.varMatris.slice(1))
                    // this.varMatris = newVarMatris
                }

                this.exIndexes();
            }
            this.allMoves.push(currentM);
            return currentM;
        }
        arrangeMatris() {
                // todo
                // // get index of smaller move brother in parent
                // // if available creat variant for him
                // console.log('pre', this.varMatris.slice());
                // let newMatris = [];
                // let currentVar = this.varMatris[0]; // todo creat first var
                // newMatris.push(currentVar);
                // let moveIndex = currentVar.moves.length - 1;


                // while (moveIndex != 0) {
                //     let brotherIndex = getBrotherIndex(currentVar.moves[moveIndex]);
                //     // console.log('', currentVar, brotherIndex);
                //     if (brotherIndex === false) {
                //         moveIndex--;
                //         continue;
                //     } else {
                //         currentVar = creatNewVar(currentVar, brotherIndex, moveIndex);
                //         console.log('next', currentVar);

                //         newMatris.push(currentVar);
                //         moveIndex = currentVar.moves.length - 1;
                //     }
                // }
                // this.varMatris = newMatris;
                // console.log('next', this.varMatris.slice());

                // function getBrotherIndex(currentM) {
                //     let index = currentM.parentMove.ans.findIndex(m => m.moveObj.san == currentM.moveObj.san);
                //     if (index > -1) {
                //         if (index == currentM.parentMove.ans.length - 1) return false;
                //         return index + 1
                //     }
                //     return false
                // }

                // function creatNewVar(lastVar, brotherIndex, nodeIndex) {
                //     let newVar = new pgn.Variant();
                //     // todo convert to slice
                //     for (let i = 0; i < nodeIndex; i++) {
                //         newVar.moves.push(lastVar.moves[i])
                //     }
                //     let lastMove = newVar.moves[newVar.moves.length - 1].ans[brotherIndex];
                //     newVar.moves.push(lastMove)
                //     while (lastMove) {
                //         lastMove = lastMove.ans[0]
                //         if (lastMove) {
                //             newVar.moves.push(lastMove)
                //         }
                //     }
                //     return newVar;
                // }
            }
            // api
        setPrefirstMove() {
            if ('FEN' in this.header) {
                this.preFirstMove.endFenObj = new pgn.Fen(this.header.FEN);;
                return;
            }
            this.preFirstMove.endFenObj = new pgn.Fen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        }
        creatComentArray() {
            let exObj = pgn.Comment.exComents(this.strPgn);
            this.comments = exObj.comments;
            this.strPgn = exObj.strPgn;
        }
        setHeader() {
            while (this.strPgn.includes(']')) {
                let openIndex = this.strPgn.indexOf('[');
                let closeIndex = this.strPgn.indexOf(']');
                let headerTopic = this.strPgn.substring(openIndex, closeIndex + 1);

                this.strPgn = this.strPgn.replace(headerTopic, "");
                headerTopic = headerTopic.replace(/\[|\]/g, "");
                let headerTopicPrats = headerTopic.split('"');
                this.header[headerTopicPrats[0].trim()] = headerTopicPrats[1];
            }
        }

        exComplexStringVariants() {
            function removeLastMove(subPg) {
                let parts = subPg.split(' ');
                let flag = false;
                for (let i = parts.length - 1; i > 0; i--) {
                    let word = parts[i];
                    if (word.includes("(")) {
                        flag = true;
                    }
                    if (word.includes(")")) {
                        flag = false;
                    }
                    if (flag && (pgn.Move.isMove(word) || word.includes(pgn.Comment.commentWord))) {
                        parts[i] = "";
                        flag = false;
                    }
                }
                return parts.join(" ", parts);
            }
            let complexStringVariants = [];
            while (this.strPgn.includes('(')) {
                let lIndex = this.strPgn.indexOf(')');
                let sub = this.strPgn.substring(0, lIndex);
                let fIndex = sub.lastIndexOf("(");
                sub = removeLastMove(sub);
                let ForRemove = this.strPgn.substring(fIndex, lIndex + 1);
                this.strPgn = this.strPgn.replace(ForRemove, '');
                complexStringVariants.push(pgn.Pgn.setFreshString(sub).split(' '));
            }
            complexStringVariants.push(pgn.Pgn.setFreshString(this.strPgn).split(' '));
            return (complexStringVariants.reverse());
        }

        exVariants() {

            let complexStringVariants = this.exComplexStringVariants();
            complexStringVariants.forEach(v => {
                this.varMatris.push(this.exOneVariant(v));
            });

            // todo ....
            this.convertToDistinctArr();
            this.CompletMoveData();

        }
        exOneVariant(complexVar) {
            let oneVar = new pgn.Variant();
            oneVar.moves[0] = this.preFirstMove;
            let currentMoveIndex = 0;
            let preMoveComments = [];
            let afterMoveComments = [];
            for (let i = 0; i < complexVar.length; i++) {
                const word = complexVar[i];
                if (word.includes(pgn.Comment.commentWord)) {
                    let commentNumber = word.split('-')[1];
                    let comment = this.comments.find(com => com.index == commentNumber);
                    if (i > 0 && complexVar[i - 1].includes('(')) {
                        preMoveComments.push(comment)
                    } else {
                        afterMoveComments.push(comment);
                    }
                }
                if (word.includes('$')) {
                    oneVar.moves[currentMoveIndex].signs.push(word);
                }
                if (pgn.Move.isMove(word)) {
                    if (afterMoveComments.length > 0) {
                        oneVar.moves[currentMoveIndex].afterComments = afterMoveComments;
                        afterMoveComments = [];
                    }
                    currentMoveIndex++;
                    let mv = new pgn.Move(word);
                    mv.preComments = preMoveComments;
                    preMoveComments = [];
                    oneVar.moves.push(mv);
                }
            }
            return oneVar;
        }

        convertToDistinctArr() {
            function replaceSameMoves(curentVar, preVar) {
                let moveIndex = 0
                while (true) {
                    if (curentVar.moves[moveIndex].word == preVar.moves[moveIndex].word) {
                        curentVar.moves[moveIndex] = preVar.moves[moveIndex];
                        moveIndex++;
                    } else {
                        return;
                    }
                }
            }
            for (let i = 1; i < this.varMatris.length; i++) {
                // this.allMoves = this.allMoves.concat(...this.varMatris[i].moves);
                replaceSameMoves(this.varMatris[i], this.varMatris[i - 1])

            }
            // this.allMoves = this.allMoves.concat(...this.varMatris[0].moves);
        }


        CompletMoveData() {

            this.setAllParentsAndChildren();
            this.exIndexes();
            // 
            this.creatDistinctAllMoves();
            this.reArengeChildren();
            this.exFenObj();
            this.exIndexes();
            // this.arrangeMatris()
        }
        exFenObj() {
            for (let i = 1; i < this.allMoves.length; i++) {
                const currentMove = this.allMoves[i];
                let chess = new Chess(currentMove.parentMove.endFenObj.strFen);
                currentMove.moveObj = chess.move(currentMove.word);
                currentMove.endFenObj = new pgn.Fen(chess.fen());
            }
        }
        exIndexes() {
            let varIndex = this.varMatris.length - 1;
            let moveIndex = 0
            for (let i = this.varMatris.length - 1; i > -1; i--) {
                const variant = this.varMatris[i];
                variant.moves.forEach(mv => {
                    mv.varIndex = varIndex;
                    mv.moveIndex = moveIndex;
                    moveIndex++;
                });
                moveIndex = 0;
                varIndex--;
            }
            // this.varMatris.forEach(variant => {

            // });
        }
        reArengeChildren() {
            for (let i = 0; i < this.allMoves.length; i++) {
                const move = this.allMoves[i];
                let shifted = move.ans.shift()
                move.ans = move.ans.reverse();
                move.ans.unshift(shifted);
            }
        }
        creatDistinctAllMoves() {
            this.varMatris.forEach(variant => {
                variant.moves.forEach(move => {
                    let f = this.allMoves.find(m2 => m2.varIndex == move.varIndex && m2.moveIndex == move.moveIndex)
                    if (!f) this.allMoves.push(move)
                });
            });
        }
        setAllParentsAndChildren() {
            for (let i = 0; i < this.varMatris.length; i++) {
                let variant = this.varMatris[i];
                variant.setMoveParents();
                variant.setChildren();
            }
        }
        toString() {
            let str = '';
            for (let i = 0; i < this.varMatris.length; i++) {
                const variant = this.varMatris[i];


            }
            this.varMatris.forEach(variant => {
                if (str == '') {
                    str = variant.toPartString();
                    return;
                }
                let mainSub = '(' + variant.toPartString() + ')';
                if (str.includes('xxxx')) {
                    let index = str.lastIndexOf('xxxx');
                    let sub1 = str.substring(0, index);
                    let sub2 = str.substring(index + 4);
                    str = sub1 + mainSub + sub2
                        // str = str.replace('xxxx', mainSub)
                }
            })

            return str

        }
        toHtml(id) {
            let str = '';
            this.varMatris.forEach(variant => {
                if (str == '') {
                    str = variant.toPartHtml();
                    return;
                }
                let mainSub = '<span class="fw-normal">(' + variant.toPartHtml() + ')</span>';
                if (str.includes('xxxx')) {
                    let index = str.lastIndexOf('xxxx');
                    let sub1 = str.substring(0, index);
                    let sub2 = str.substring(index + 4);
                    str = sub1 + mainSub + sub2
                        // str = str.replace('xxxx', mainSub)
                }

            });

            document.getElementById(id).innerHTML = str;
            return str
        }
    }
}