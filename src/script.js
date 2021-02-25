const dictionaryDatabaseLink = 'https://raw.githubusercontent.com/farhanfuad35/lumos/main/data/E2Bdatabase.json';
const radix = 128
const mod = 33489857205
const primeForPrimaryHash =  103643        // this is also our table row number.
var indexglobe
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
        for(var i = element.length - 1; i >= 0; i--)
        {
            value = ((value % mod) + (element.charCodeAt(i) * exp) % mod) % mod
            exp = (exp * radix) % mod
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
    wordExistsTwice(arr, wordInsert)
    {
        for(var i = 0; i < arr.length; i++)
        {
            if(this.words[arr[i]].en == wordInsert)
            {
                return true
            }
        }
        return false
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
            if(this.words[i].en == 'bye') indexglobe = i
            var key = this.calculateKeyvalue(this.words[i].en)
            var hashvalue = this.calculateHashvalue(key,primeForPrimaryHash)
            if(this.words[i].en == 'bye') console.log('primary' + hashvalue)
            if(this.wordExistsTwice(this.hashtable[hashvalue], this.words[i].en) == false)
            {
                this.hashtable[hashvalue].push(i)
            }
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
        while(1)
        {
            cnt++
            if(cnt > 20) 
            {
                for(var l = 0; l < wordarr.length; l++)
                {
                    console.log(this.words[wordarr[i]].en)
                }
                throw new Error 
            }
            arr.fill(-1)
            var flag = true 
            var a
            var b
            a = Math.floor(Math.random() * (mod - 1) ) + 1
            b = Math.floor(Math.random() * mod)
            console.log('here1')
            for(var i = 0; i < wordarr.length; i++)
            {
                var key = this.calculateKeyvalue(this.words[wordarr[i]].en)
                a = BigInt(a)
                b = BigInt(b)
                var hashv = (a * BigInt(key) + b)
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
            console.log(dictionary.calculateKeyvalue('false'))
            console.log(dictionary.calculateKeyvalue(dictionary.words[0].en))
            dictionary.creatingPrimaryHashTable()
            dictionary.creatingSecondaryHashTable()
            search()
        })   
}
// function for searching button onclick

function search()
{
    var w = 'bye'
    w = w.toLowerCase()
    var key = dictionary.calculateKeyvalue(w)
    console.log('serachkey ' + key)
    var phash = dictionary.calculateHashvalue(key)
    var a = dictionary.hashtablekeys[phash][0] 
    var b = dictionary.hashtablekeys[phash][1]
    var m = dictionary.hashtablekeys[phash][2]
    a = BigInt(a)
    b = BigInt(b)
    var hashv = (a * BigInt(key) + b)
    hashv = hashv % BigInt(m)
    hashv = Number(hashv)
    console.log(a + ' ' + b + ' ' + ' ' + m + ' search')
    console.log('primesearch ' + phash)
    console.log('seconsearch ' + hashv)
    var i = dictionary.hashtable[phash][hashv]
    console.log(i)
    if((dictionary.words[i].en) == w)
    {
        console.log(dictionary.words[i].bn)
    }


}