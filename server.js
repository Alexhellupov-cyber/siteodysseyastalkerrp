const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcrypt');
const SteamStrategy = require('passport-steam').Strategy;
const crypto = require('crypto');
const usersFile =
'./database/users.json';

let usersData = {};
const adminsFile =
'./database/admins.json';

let admins = [];
if(fs.existsSync(adminsFile)){

    admins = JSON.parse(

        fs.readFileSync(
            adminsFile,
            'utf8'
        )

    );

}

function isAdmin(req){

    if(!req.user)
        return false;

    return admins.some(
        admin=>

        admin.steamid
        === req.user.id
    );

}
function saveUsers(){

    fs.writeFileSync(

        usersFile,

        JSON.stringify(
            usersData,
            null,
            4
        )

    );

}

async function sendDiscordLog(
    user,
    item
){

    const webhook =

    'https://discord.com/api/webhooks/1508066317587054634/asLd4ry0hyG_A6GVmzyVysxgiPaNRUYLpDKdVrErMF79nkj-CTSkLHafdrYxIaxg5yCI';

    await axios.post(
        webhook,
        {

            embeds:[{

                title:
                '🛒 Новая выдача',

                color:65280,

                fields:[

                    {
                        name:'Игрок',
                        value:user.displayName
                    },

                    {
                        name:'SteamID',
                        value:user.id
                    },

                    {
                        name:'Предмет',
                        value:item.name
                    }

                ],

                timestamp:
                new Date()

            }]

        }
    );

}

if(fs.existsSync(usersFile)){

    usersData = JSON.parse(

        fs.readFileSync(
            usersFile,
            'utf8'
        )

    );

}
const app = express();
app.use(express.json());
app.use(session({

    secret:'odysseya_secret',

    resave:true,

    saveUninitialized:true,

    cookie:{
        secure:false
    }

}));

app.use(passport.initialize());

app.use(passport.session());

app.use((req,res,next)=>{

    console.log(req.user);

    next();

});

passport.serializeUser((user,done)=>{
    done(null,user);
});

passport.deserializeUser((obj,done)=>{
    done(null,obj);
});

passport.use(new SteamStrategy(
{
    returnURL:'https://odysseyarp.com/auth/steam/return',
    realm:'https://odysseyarp.com/',
    apiKey:'7C4862687451C448058D6FDD0793D37F'
},
(identifier,profile,done)=>{

    const steamid = profile.id;

if(!usersData[steamid]){

    usersData[steamid] = {

        balance:125000,

        inventory:[],

        purchases:[],

        nickname:
        profile.displayName,

        avatar:
        profile.photos[2].value

    };

}else{

    usersData[steamid]
    .nickname =
    profile.displayName;

    usersData[steamid]
    .avatar =
    profile.photos[2].value;
    
}
saveUsers();

return done(null,profile);

}));

app.use(express.static('public'));

app.get('/auth/steam',
    passport.authenticate('steam')
);

app.get('/auth/steam/return',
    passport.authenticate('steam',{
        failureRedirect:'/'
    }),
    (req,res)=>{
        res.redirect('/cabinet.html');
    }
);

app.get('/api/user',(req,res)=>{

    if(!req.user){

        return res.json(null);
    }

    res.json({
        name:req.user.displayName,
        steamid:req.user.id,
        avatar:req.user.photos[2].value
    });

});

app.get('/api/data',(req,res)=>{

    if(!req.user){

        return res.json(null);
    }

    const steamid = req.user.id;

    res.json(
        usersData[steamid]
    );

});

app.post('/buy/:item',(req,res)=>{

    if(!req.user){

        return res.status(401).json({
            error:'not auth'
        });
    }

    const steamid = req.user.id;

    const user =
    usersData[steamid];

    const shop = {
        forweapons_30mag762banana:{
            name:'30-патронный магазин 7.62x39 мм БАНАН',
            price:200
        },
        forweapons_40mag556:{
            name:'40-патронный магазин 5.56x45 мм',
            price:300
        },
        forweapons_40mag762:{
            name:'40-патронный магазин 7.62x39 мм',
            price:300
        },
        forweapons_45mag545:{
            name:'45-патронный магазин 5.45x39 мм',
            price:300
        },
        forweapons_60mag545:{
            name:'60-патронный магазин 5.45x39 мм',
            price:350
        },
        forweapons_ammo545:{
            name:' Патроны 5.45x39 мм(200 шт)',
            price:100
        },
        forweapons_ammo556:{
            name:' Патроны 5.56x45 мм(200 шт)',
            price:100
        },
        forweapons_ammo76239:{
            name:' Патроны 7.62x39 мм(200 шт)',
            price:150
        },
        forweapons_ammo76254:{
            name:' Патроны 7.62x54 мм(200 шт)',
            price:150
        },
        forweapons_ammo939:{
            name:' Патроны 9x39 мм(200 шт)',
            price:200
        },
        forweapons_suppresor545:{
            name:'Глушитель для 5.45x39 мм',
            price:1000
        },
        forweapons_suppresor545v2:{
            name:'Глушитель для 5.45x39 мм v2',
            price:1000
        },
        forweapons_suppresor556:{
            name:'Глушитель для 5.56x45 мм',
            price:1000
        },
        forweapons_suppresorunivers:{
            name:'Универсальный глушитель',
            price:1300
        },
        weapon_ak103:{
            name:'AK-103',
            price:900
        },
        weapon_ak12:{
            name:'AK 12',
            price:700
        },
        weapon_akm:{
            name:'AKM',
            price:1000
        },
        weapon_an94:{
            name:'AN-94',
            price:600
        },
        weapon_asval:{
            name:'AS VAL',
            price:1250
        },
        weapon_aug:{
            name:'AUG',
            price:800
        },
        weapon_famas:{
            name:'FAMAS',
            price:1250
        },
        weapon_m4a1:{
            name:'M4A1',
            price:800
        },
        weapon_mdar:{
            name:'M DAR',
            price:1000
        },
        weapon_mk47:{
            name:'M4A1',
            price:1250
        },
        weapon_vepr:{
            name:'M4A1',
            price:1200
        },
        weapon_vss:{
            name:'VSS',
            price:1750
        },
        detektor_otklik:{
            name:'Детектор Отклик',
            price:500
        },
        detektor_medved:{
            name:'Детектор Медведь',
            price:1000
        },
        detektor_svarog:{
            name:'Детектор Сварог',
            price:2000
        },
        detektor_velas:{
            name:'Детектор Велес',
            price:1500
        },
        protivogaz_m40:{
            name:'Противогаз М40',
            price:2000
        },
        protivogaz_avc:{
            name:'Противогаз AVC',
            price:1500
        },
        furnitura_barrel:{
            name:'Бочка AVC',
            price:500
        },
        furnitura_create1:{
            name:'Ящик',
            price:650
        },
        furnitura_create1:{
            name:'Ящик',
            price:650
        },
        furnitura_gunwall1:{
            name:'Стенд для оружия',
            price:1000
        },
        furnitura_locker01:{
            name:'Шкаф',
            price:650
        },
        furnitura_locker02:{
            name:'Шкаф В2',
            price:1500
        },
        furnitura_locker03:{
            name:'Шкаф В3',
            price:600
        },
        forvehicle_spark:{
            name:'Свеча зажигания',
            price:500
        },
        forvehicle_caraccum:{
            name:'Аккумулятор для автомобиля',
            price:500
        },
        forvehicle_koleso:{
            name:'Колесо (для любого автомобиля)',
            price:1000
        },
        forvehicle_radiator:{
            name:'Радиатор',
            price:500
        },
        forvehicle_repairkit:{
            name:'Комплект для ремонта шин',
            price:200
        },
        forvehicle_truckaccum:{
            name:'Аккумулятор для грузовика',
            price:500
        },
        forvehicle_pochinka:{
            name:'Полная починка авто',
            price:2000
        },


        bmw:{
            name:'BMW E34',
            price:4500
        },
        brdm:{
            name:'BRDM-2',
            price:7000
        },
        btr80:{
            name:'BTR-80',
            price:8000
        },
        btr80p:{
            name:'BTR-80P',
            price:13000
        },
        volga:{
            name:'VOLGA',
            price:4000
        }, 
        gaz66:{
            name:'GAZ-66',
            price:6500
        },
        ij2125:{
            name:'IJ-2125',
            price:4500
        }, 
        ij2140:{
            name:'IJ-2140',
            price:4500
        },  
        landrover:{
            name:'Land Rover Defender 110',
            price:5000
        },
        liaz:{
            name:'liaz 577',
            price:7000
        },
        luaz:{
            name:'luaz 969',
            price:3500
        },
        niva:{
            name:'Niva 2329',
            price:3000
        },
        patriot:{
            name:'Patriot 2760 RUS',
            price:4500
        },
        uaz33094:{
            name:'UAZ 33094',
            price:5000
        },
        uaz3962:{
            name:'UAZ 3962',
            price:4500
        },
        uaz469army:{
            name:'UAZ 469 Army',
            price:5000
        },
        uaz469hunter:{
            name:'UAZ 469 Hunter',
            price:5500
        },
        uazpatrionpikap:{
            name:'UAZ Patrion Pikap',
            price:4500
        },
        vaz2109:{
            name:'VAZ 2109',
            price:4000
        },
        vaz2104rf:{
            name:'VAZ 2104 RF',
            price:4000
        },
        vaz2107:{
            name:'VAZ 2107',
            price:4000
        },
        zaz968:{
            name:'ZAZ 968',
            price:3500
        },
             

    };

    const item =
    shop[req.params.item];

    if(!item){

        return res.json({
            error:'item not found'
        });
    }

    if(user.balance < item.price){

        return res.json({
            error:'not enough money'
        });
    }

    user.balance -= item.price;

    user.inventory.push({

        id:req.params.item,

        name:item.name

    });

    user.purchases.push({
        name:item.name,
        date:new Date()
    });
    
    saveUsers();

    res.json({
        success:true
    });

});


app.get('/logout',(req,res)=>{

    req.logout(()=>{

        res.redirect('/index.html');

    });

});

app.get('/admin/user/:steamid',(req,res)=>{
    if(
    !req.session.isAdmin
){

    return res.status(403)
    .json({
        error:'access denied'
    });

}
    const user =
    usersData[req.params.steamid];

    if(!user){

        return res.json({
            error:'user not found'
        });
    }

    res.json({

    ...user,

    name:user.nickname,

    avatar:user.avatar

});

});

app.post('/admin/balance',(req,res)=>{
if(
    !req.session.isAdmin
){

    return res.status(403)
    .json({
        error:'access denied'
    });

}
    const {
        steamid,
        balance
    } = req.body;

    if(!usersData[steamid]){

        return res.json({
            error:'user not found'
        });
    }

    usersData[steamid]
    .balance = Number(balance);

    saveUsers();

    res.json({
        success:true
    });

});

app.post('/admin/add-item',(req,res)=>{
if(
    !req.session.isAdmin
){

    return res.status(403)
    .json({
        error:'access denied'
    });

}
    const {
        steamid,
        item
    } = req.body;
        const shop = {

        forweapons_30mag762banana:{
            name:'30-патронный магазин 7.62x39 мм БАНАН',
            price:200
        },
        forweapons_40mag556:{
            name:'40-патронный магазин 5.56x45 мм',
            price:300
        },
        forweapons_40mag762:{
            name:'40-патронный магазин 7.62x39 мм',
            price:300
        },
        forweapons_45mag545:{
            name:'45-патронный магазин 5.45x39 мм',
            price:300
        },
        forweapons_60mag545:{
            name:'60-патронный магазин 5.45x39 мм',
            price:350
        },
        forweapons_ammo545:{
            name:' Патроны 5.45x39 мм(200 шт)',
            price:100
        },
        forweapons_ammo556:{
            name:' Патроны 5.56x45 мм(200 шт)',
            price:100
        },
        forweapons_ammo76239:{
            name:' Патроны 7.62x39 мм(200 шт)',
            price:150
        },
        forweapons_ammo76254:{
            name:' Патроны 7.62x54 мм(200 шт)',
            price:150
        },
        forweapons_ammo939:{
            name:' Патроны 9x39 мм(200 шт)',
            price:200
        },
        forweapons_suppresor545:{
            name:'Глушитель для 5.45x39 мм',
            price:1000
        },
        forweapons_suppresor545v2:{
            name:'Глушитель для 5.45x39 мм v2',
            price:1000
        },
        forweapons_suppresor556:{
            name:'Глушитель для 5.56x45 мм',
            price:1000
        },
        forweapons_suppresorunivers:{
            name:'Универсальный глушитель',
            price:1300
        },
        weapon_ak103:{
            name:'AK-103',
            price:900
        },
        weapon_ak12:{
            name:'AK 12',
            price:700
        },
        weapon_akm:{
            name:'AKM',
            price:1000
        },
        weapon_an94:{
            name:'AN-94',
            price:600
        },
        weapon_asval:{
            name:'AS VAL',
            price:1250
        },
        weapon_aug:{
            name:'AUG',
            price:800
        },
        weapon_famas:{
            name:'FAMAS',
            price:1250
        },
        weapon_m4a1:{
            name:'M4A1',
            price:800
        },
        weapon_mdar:{
            name:'M DAR',
            price:1000
        },
        weapon_mk47:{
            name:'M4A1',
            price:1250
        },
        weapon_vepr:{
            name:'M4A1',
            price:1200
        },
        weapon_vss:{
            name:'VSS',
            price:1750
        },
        detektor_medved:{
            name:'Детектор Медведь',

        },
        detektor_svarog:{
            name:'Детектор Сварог',

        },
        detektor_velas:{
            name:'Детектор Велес',

        },
        protivogaz_m40:{
            name:'Противогаз М40',

        },
        protivogaz_avc:{
            name:'Противогаз AVC',

        },
        furnitura_barrel:{
            name:'Бочка AVC',

        },
        furnitura_create1:{
            name:'Ящик',

        },
        furnitura_create1:{
            name:'Ящик',

        },
        furnitura_gunwall1:{
            name:'Стенд для оружия',

        },
        furnitura_locker01:{
            name:'Шкаф',

        },
        furnitura_locker02:{
            name:'Шкаф В2',

        },
        furnitura_locker03:{
            name:'Шкаф В3',

        },
        forvehicle_spark:{
            name:'Свеча зажигания',

        },
        forvehicle_caraccum:{
            name:'Аккумулятор для автомобиля',

        },
        forvehicle_koleso:{
            name:'Колесо (для любого автомобиля)',

        },
        forvehicle_radiator:{
            name:'Радиатор',

        },
        forvehicle_repairkit:{
            name:'Комплект для ремонта шин',

        },
        forvehicle_pochinka:{
            name:'Полная починка авто',
        },
        forvehicle_truckaccum:{
            name:'Аккумулятор для грузовика',

        },


        bmw:{
            name:'BMW E34',

        },
        brdm:{
            name:'BRDM-2',

        },
        btr80:{
            name:'BTR-80',

        },
        btr80p:{
            name:'BTR-80P',
            price:13000
        },
        volga:{
            name:'VOLGA',
            price:4000
        }, 
        gaz66:{
            name:'GAZ-66',
            price:6500
        },
        ij2125:{
            name:'IJ-2125',
            price:4500
        }, 
        ij2140:{
            name:'IJ-2140',
            price:4500
        },  
        landrover:{
            name:'Land Rover Defender 110',
            price:5000
        },
        liaz:{
            name:'liaz 577',
            price:7000
        },
        luaz:{
            name:'luaz 969',
            price:3500
        },
        niva:{
            name:'Niva 2329',
            price:3000
        },
        patriot:{
            name:'Patriot 2760 RUS',
            price:4500
        },
        uaz33094:{
            name:'UAZ 33094',
            price:5000
        },
        uaz3962:{
            name:'UAZ 3962',
            price:4500
        },
        uaz469army:{
            name:'UAZ 469 Army',
            price:5000
        },
        uaz469hunter:{
            name:'UAZ 469 Hunter',
            price:5500
        },
        uazpatrionpikap:{
            name:'UAZ Patrion Pikap',
            price:4500
        },
        vaz2109:{
            name:'VAZ 2109',
            price:4000
        },
        vaz2104rf:{
            name:'VAZ 2104 RF',
            price:4000
        },
        vaz2107:{
            name:'VAZ 2107',
            price:4000
        },
        zaz968:{
            name:'ZAZ 968',
            price:3500
        },

    };

    if(!usersData[steamid]){

        return res.json({
            error:'user not found'
        });
    }

    const shopItem =
shop[item];

if(!shopItem){

    return res.json({
        error:'item not found'
    });

}

usersData[steamid]
.inventory
.push({

    id:item,

    name:shopItem.name

});

    saveUsers();

    res.json({
        success:true
    });

});
app.post('/claim/:item',async(req,res)=>{

    if(!req.user){

        return res.json({
            error:'not auth'
        });

    }

    const steamid =
    req.user.id;

    const user =
    usersData[steamid];

    const inventoryItem =
    user.inventory.find(i=>

        i.id === req.params.item

    );

    if(!inventoryItem){

        return res.json({
            error:'item not found'
        });

    }

    const itemIndex =

user.inventory.findIndex(i=>

    i.id === req.params.item

);

if(itemIndex !== -1){

    user.inventory.splice(
        itemIndex,
        1
    );

}
    await sendDiscordLog(
    req.user,
    inventoryItem
);

    saveUsers();
    
    res.json({
        success:true
    });

});
app.get(
'/admin.html',

(req,res)=>{

    if(!req.user){

        return res.redirect(
            '/index.html'
        );

    }

    const admin =
    admins.find(

        a=>
        a.steamid
        === req.user.id

    );

    if(!admin){

        return res.redirect(
            '/index.html'
        );

    }

    res.sendFile(

        path.join(
            __dirname,
            'public',
            'admin.html'
        )

    );

});
app.use(express.static('public'));
app.post(
'/admin/login',

async(req,res)=>{

    if(!req.user){

        return res.json({
            error:'not auth'
        });

    }

    const admin =
    admins.find(

        a=>
        a.steamid
        === req.user.id

    );

    if(!admin){

        return res.json({
            error:'not admin'
        });

    }

    const valid =
    await bcrypt.compare(

        req.body.password,
        admin.password

    );

    if(!valid){

        return res.json({
            error:'wrong password'
        });

    }

    req.session.isAdmin =
    true;

    res.json({
        success:true
    });

});
app.post(
'/admin/remove-item',

(req,res)=>{

    if(
        !req.session.isAdmin
    ){

        return res.status(403)
        .json({
            error:'access denied'
        });

    }

    const {
        steamid,
        itemId
    } = req.body;

    if(
        !usersData[steamid]
    ){

        return res.json({
            error:'user not found'
        });

    }

    const user =
    usersData[steamid];

    const index =

    user.inventory.findIndex(
        i=>

        i.id === itemId
    );

    if(index !== -1){

        user.inventory.splice(
            index,
            1
        );

    }

    saveUsers();

    res.json({
        success:true
    });

});

app.post(
'/create-payment',

(req,res)=>{

    if(!req.user){

        return res.json({
            error:'auth required'
        });

    }

    const amount =
    Number(req.body.amount);

    const orderId =
    Date.now();

    const merchantId =
    '73444';

    const secret =
    'yushchenko';

    const currency =
    'RUB';

    const sign = crypto
    .createHash('md5')
    .update(

        merchantId
        + ':'
        + amount
        + ':'
        + secret
        + ':'
        + currency
        + ':'
        + orderId

    )
    .digest('hex');

    const url =

`https://pay.fk.money/?m=${merchantId}&oa=${amount}&currency=${currency}&o=${orderId}&s=${sign}&us_steamid=${req.user.id}`;

    res.json({
        url
    });

});

app.post(

'/freekassa/result',

express.urlencoded({
    extended:true
}),

(req,res)=>{

    const merchantId =
    req.body.MERCHANT_ID;

    const amount =
    req.body.AMOUNT;

    const orderId =
    req.body.MERCHANT_ORDER_ID;

    const steamid =
    req.body.us_steamid;

    const fkSign =
    req.body.SIGN;

    const sign =
    crypto
    .createHash('md5')
    .update(

        merchantId
        + ':'
        + amount
        + ':'
        + 'Ющенко'
        + ':'
        + orderId

    )
    .digest('hex');

    if(
        sign !== fkSign
    ){

        console.log(
            '[FK] BAD SIGN'
        );

        return res.send(
            'bad sign'
        );

    }

    if(
        !usersData[steamid]
    ){

        return res.send(
            'user not found'
        );

    }

    usersData[steamid]
    .balance +=
    Number(amount);

    saveUsers();

    console.log(

        '[FK] PAYMENT SUCCESS:',

        steamid,

        amount

    );

    res.send('YES');

});

app.listen(3000,()=>{

    console.log('SERVER STARTED');

});