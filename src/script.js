const dictionaryDatabaseLink = 'https://raw.githubusercontent.com/Nafisa41/Dictionary--English-to-Bangla-/master/Database/E2Bdatabase.json';
const radix = 128
const mod = 100000000003
const primeForPrimaryHash =  103643        // this is also our table row number.
var callglobe = 0
class Dictionary{
    words
    wordCount 
    hashtable
    primaryHashA 
    primaryHashB
    hashtablekeys // hashtablekeys[1] -> a,b,m
    init()
    {
        this.hashtable = new Array(primeForPrimaryHash)
        this.hashtablekeys = new Array(primeForPrimaryHash)
        for(var i = 0; i < primeForPrimaryHash; i++)
        {
            this.hashtable[i] = []
            this.hashtablekeys[i] = []
        }
    }
    calculateKeyvalue(element)
    {
        var value = 0
        var exp = 1
        for(var i = 0; i < element.length; i++){
            value = ((value * radix) % mod + element.charCodeAt(i)) % mod;
        }
        return value
    }
    calculateHashvalue(key)
    {
        var a = BigInt(this.primaryHashA)
        var b = BigInt(this.primaryHashB)
        var hashv = (a * BigInt(key) + b)
        hashv = hashv % BigInt(primeForPrimaryHash)
        hashv = Number(hashv)
        return hashv
    }
    noDuplicate(array, word){
        // Given a word and an array this function checks if the word already
        // exists in the array

        var unique = true;
        for(var i=0; i<array.length; i++){
            if(this.words[array[i]].en == word){
                unique = false;
                break;
            }
        }
        return unique;
    }
    creatingPrimaryHashTable()
    {
        this.init()
        var a = Math.floor(Math.random() * (mod - 1) ) + 1;
        var b = Math.floor(Math.random() * mod);
        this.primaryHashA = a
        this.primaryHashB = b
        for(var i = 0; i < this.words.length; i++)
        {
            var key = this.calculateKeyvalue(this.words[i].en)
            var hashvalue = this.calculateHashvalue(key)
            this.hashtable[hashvalue].push(i)
        }

        // maximum collision in one slot
        var max = -1
        for(var i = 0; i < primeForPrimaryHash; i++)
        {
            max = Math.max(this.hashtable[i].length, max)
        }
        console.log(max)
    }
    creatingSecondaryHashTable()
    {
        for(var i = 0; i < primeForPrimaryHash; i++)
        {
            // when there is no collision in a slot
            if(this.hashtable[i].length == 1)  
            {
                this.hashtablekeys[i][0] = 1
                this.hashtablekeys[i][1] = 0
                this.hashtablekeys[i][2] = 1
            } 
            // when there is collision in  a slot
            if(this.hashtable[i].length > 1)
            {   
            
                var sameSlotWords = []
                for(var j = 0; j < this.hashtable[i].length; j++)
                {
                    sameSlotWords.push(this.hashtable[i][j])
                }
                this.calculateValueofABM(sameSlotWords, i)
            }
        }
    }
    calculateValueofABM(wordarr, idx)
    {
        var cnt = 0
        var m = wordarr.length * wordarr.length
        var arr
        arr = new Array(m)
        var a
        var b

        // idx = 2 123 5574 33  m = 9
        while(1)
        {
            cnt++
            arr.fill(-1)
            var flag = true 
            a = Math.floor(Math.random() * (mod - 1) ) + 1 // 1 to p - 1
            b = Math.floor(Math.random() * mod)
            for(var i = 0; i < wordarr.length; i++)
            {
                var key = this.calculateKeyvalue(this.words[wordarr[i]].en)
                var aa = BigInt(a)
                var bb = BigInt(b)
                var keyk = BigInt(key)
                var hashv = ((aa * keyk)%BigInt(mod) + BigInt(bb))% BigInt(mod)
                hashv = hashv % BigInt(m)
                hashv = Number(hashv)
                
                if(arr[hashv] == -1) arr[hashv] = wordarr[i]
                else
                {
                    flag = false
                    break
                }
            }

            if(flag == true)
            { 
                this.hashtablekeys[idx][0] = Number(a)
                this.hashtablekeys[idx][1] = Number(b)
                this.hashtablekeys[idx][2] = Number(m)
                this.hashtable[idx] = arr
                break
            }
        }
    }
}

var dictionary = new Dictionary()

window.onload = function getDictionary(){
    console.log('Data Received')
    fetch(dictionaryDatabaseLink)
        .then(response => {
            if(!response.ok){
                throw new Error("Something went wrong " + response.status);
            }
            return response.json()
        })
        .then(json => {
            dictionary.words = json;
            dictionary.wordCount = Object.keys(dictionary.words).length
            dictionary.creatingPrimaryHashTable()
            dictionary.creatingSecondaryHashTable()
            search()
        })   
}
// function for searching button onclick
function emptyTextfield()
{
    w = document.getElementById('keyword')
    var display = document.getElementById('display')
    if(w.value.length == 0) display.innerHTML = ""
    return
}
function search()
{
    var w = document.getElementById('keyword')
    var display = document.getElementById('display')
    if(w.value.length == 0) {
        display.innerHTML = ""
        return 
    }
    w = w.value.toLowerCase()
    var key = dictionary.calculateKeyvalue(w)
    var phash = dictionary.calculateHashvalue(key)
    if(dictionary.hashtablekeys[phash] == undefined)
    {
        alert("Word not found!")
    }
    var a = dictionary.hashtablekeys[phash][0] 
    var b = dictionary.hashtablekeys[phash][1]
    var m = dictionary.hashtablekeys[phash][2]
    var aa = BigInt(a)
    var bb = BigInt(b)
    var keyk = BigInt(key)
    var hashv = ( (aa * keyk)%BigInt(mod) + BigInt(bb))% BigInt(mod)
    hashv = hashv % BigInt(m)
    hashv = Number(hashv)
    var i = dictionary.hashtable[phash][hashv]
    if(i >= 0 && (dictionary.words[i].en) == w)
    {
        display.innerHTML = dictionary.words[i].bn
        console.log(dictionary.words[i].bn)
    }
    else 
    {
        alert("word not found!")
    }

}
