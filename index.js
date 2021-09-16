const {
    MongoClient
} = require("mongodb")
const puppeteer = require("puppeteer");
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const dotenv = require('dotenv')
dotenv.config();


app.use(
    cors({
        origin: "*",
    })
);
app.use(express.json());

const url = "mongodb+srv://yadharth:chitra@cluster0.xa74m.mongodb.net/fk?retryWrites=true&w=majority"

async function fkdata() {
    const client = new MongoClient(url);
    var browser = await puppeteer.launch();
    var page = await browser.newPage();
    await page.goto("https://www.flipkart.com/search?q=shoes&sid=osp%2Ccil%2C1cu&as=on&as-show=on&otracker=AS_QueryStore_OrganicAutoSuggest_1_5_na_na_na&otracker1=AS_QueryStore_OrganicAutoSuggest_1_5_na_na_na&as-pos=1&as-type=RECENT&suggestionId=shoes%7CMen%27s+Sports+Shoes&requestId=d43152c1-dc12-4888-a439-2f9eb19ca15c&as-searchtext=shoes&page=2");

    //getting price
    //price
    var prices = await page.$$eval(
        "#container > div > div._36fx1h._6t1WkM._3HqJxg > div._1YokD2._2GoDe3 > div > div > div > div > div > div > a._3bPFwb > div > div._30jeq3",
        (price) => {
            return price.map((x) => x.textContent);
        }
    );
    //converting prices array into tprices object
    var tprices = (Object.assign({}, prices));
    //separating each element in the object into separate object
    const splitprices = rs => {
        const amount = Object.keys(rs);
        const pres = [];
        for (let i = 0; i < amount.length; i++) {
            pres.push({
                'price': rs[amount[i]]
            });
        };
        return pres;
    };
    var bookprice = [];
    bookprice = splitprices(tprices);
    //----------------------------------------------------------------------------->

    //getting name
    //names
    var names = await page.$$eval(
        "#container > div > div._36fx1h._6t1WkM._3HqJxg > div._1YokD2._2GoDe3 > div > div > div > div > div > div > a.IRpwTa",
        (name) => {
            return name.map((x) => x.textContent);
        }
    );
    //converting names array into tnames object
    var tnames = (Object.assign({}, names));
    //separating each element in the object into separate object
    const splitnames = obj => {
        const keys = Object.keys(obj);
        const res = [];
        for (let i = 0; i < keys.length; i++) {
            res.push({
                'name': obj[keys[i]]
            });
        };
        return res;
    };
    var books = [];
    books = splitnames(tnames);
    //----------------------------------------------------------------------------->

    //getting type
    //type
    var types = await page.$$eval(
        "#container > div > div._36fx1h._6t1WkM._3HqJxg > div._1YokD2._2GoDe3 > div> div > div > div > div > div > div._2WkVRV",
        (type) => {
            return type.map((x) => x.textContent);
        }
    );
    //converting type array into treviews object
    var ttypes = (Object.assign({}, types));
    //separating each element in the object into separate object
    const splittypes = robj => {
        const rkeys = Object.keys(robj);
        const rres = [];
        for (let i = 0; i < rkeys.length; i++) {
            rres.push({
                'type': robj[rkeys[i]]
            });
        };
        return rres;
    };
    var typeofs = [];
    typeofs = splittypes(ttypes);

    //----------------------------------------------------------------------------->
    //getting offers 
    //offers 
    var offers = await page.$$eval(
        "#container > div > div._36fx1h._6t1WkM._3HqJxg > div._1YokD2._2GoDe3 > div > div > div > div> div > div > a._3bPFwb > div > div._3Ay6Sb > span",
        (offer) => {
            return offer.map((x) => x.textContent);
        }
    );
    for (let i = 0; i < offers.length; i++) {
        if (offers[i] == '') {
            offers[i] = 0;
        }
    }
    var n = -1;
    var offersx = [];
    for (let i = 0; i < offers.length; i++) {
        if (offers[i] != 0) {
            n++;
            offersx[n] = offers[i];
        }
    }
    //converting reviews array into toffers object
    var toffers = (Object.assign({}, offersx));
    //separating each element in the object into separate object
    const splitoffers = sobj => {
        const skeys = Object.keys(sobj);
        const sres = [];
        for (let i = 0; i < skeys.length; i++) {
            sres.push({
                'offers': sobj[skeys[i]]
            });
        };
        return sres;
    };
    var discounts = [];
    discounts = splitoffers(toffers);

    //----------------------------------------------------------------------------->
    //getting srcs
    //srcs 
    var srcs = await page.$$eval(
        "#container > div > div._36fx1h._6t1WkM._3HqJxg > div._1YokD2._2GoDe3 > div > div > div > div > div > a > div > div > div > div > img",
        (src) => {
            return src.map((x) => x.src);
        }
    );
    //converting reviews array into toffers object
    var tsrcs = (Object.assign({}, srcs));
    //separating each element in the object into separate object
    const splitsrcs = iobj => {
        const ikeys = Object.keys(iobj);
        const ires = [];
        for (let i = 0; i < ikeys.length; i++) {
            ires.push({
                'srcs': iobj[ikeys[i]]
            });
        };
        return ires;
    };
    var imgs = [];
    imgs = splitsrcs(tsrcs);

    // spread1--------------------------------------------------------------------->

    const datas = [];
    for (let i = 0; i < books.length; i++) {
        datas[i] = {
            ...books[i],
            ...bookprice[i],
            ...typeofs[i],
            ...imgs[i],
            ...discounts[i]
        }
    }
    for (let i = 0; i < datas.length; i++) {
        console.log(datas[i]);
    }

    //  mongodb


    try {
        await client.connect();
        await list(client, [...datas])
        console.log('Connected successfully to server');
    } catch (error) {
        console.log("error")
    } finally {
        client.close()
    }


    await browser.close();
}
fkdata().catch(console.error);

async function list(client, datas) {
    await client.db("fk").collection("fk").deleteMany({});
    const insert = await client.db("fk").collection("fk").insertMany(datas);

    console.log("working");
}

app.get("/", async function(req, res) {
    try {
        //connceting db
        let client = await MongoClient.connect(url)
            //select db
        let db = client.db("fk")
            //select collection and perform action
        let data = await db.collection("fk").find({}).toArray();
        //close connection
        await client.close();
        res.json(data)
    } catch (error) {
        res.status(500).json({
            message: "didn't get it"
        })
    }
})

app.listen(PORT, function() {
    console.log(`App is runnning Successfully in port ${PORT} ! `)
})