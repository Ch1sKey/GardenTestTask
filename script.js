var createId = function() {
    const abc = 'abcdefghijklmnopqrstuvw1234567890';
    return Array(8).fill().map(function(x){
        return abc[Math.floor(Math.random() * (abc.length - 1))];
    }).join('');
}

var Apple = function(paretnTreeId,isNew){
    this.id = createId();
    this.coords = {
        y: Math.floor(Math.random()*85) + 24,
        x: Math.floor(Math.random()*108) + 17,
    };
    this.rotten = false;
    this.onTree = true;
    this.paretnTreeId = paretnTreeId;
    this.oldOutOfTree = 0;
    this.old = isNew ? 0 : Math.floor(Math.random()*29);
}

Apple.prototype.passDay = function(){
    this.old += 1;
    if(!this.onTree){
        this.oldOutOfTree += 1;
    }    

    if(this.old >= 30){
        this.onTree = false;
    }    

    if(this.oldOutOfTree > 0){
        this.rotten = true;
    }

}


var Tree = function(apples, parentGardenId){
    var id = createId();
    this.coords = {
        y: Math.floor(Math.random()*230) + 90,
        x: Math.floor(Math.random()*1750) + 10
    }
    this.old = 0;
    this.id = id;
    this.parentGardenId = parentGardenId;
    this.daysToSpawnApple = 30;
    this.apples = Array(apples || 0).fill().map(function(){
        return new Apple(id);
    })    
};

Tree.prototype.spawnApple = function(applesToSpawn){
    for(let i = 0; i < applesToSpawn; i++){
        this.apples.push(new Apple(this.id));
    }
}

Tree.prototype.passDay = function(){
    var that = this;
    this.old += 1;
    this.daysToSpawnApple -= 1;
    if(this.daysToSpawnApple === 0){
        this.spawnApple( Math.floor(Math.random()*5) + 1 );  // Сделаем спавн от 1 до 5 яблок раз в 30 дней. По одному как-то не интересно. 
        this.daysToSpawnApple = 30;
    }
    this.apples = this.apples.filter(function(apple){
        apple.passDay();
        if(apple.rotten  && that.parentGardenId && apple.oldOutOfTree === 1){
            Garden.list.find(function(garden){
                return garden.id === that.parentGardenId;
            }).rottenCounter += 1;
        }
        return (apple.oldOutOfTree < 4);
    });
}

var Garden = function(trees, apples){
    var id = createId();
    this.id = id;
    this.old = 0;
    this.rottenCounter = 0;
    this.trees = Array(trees || 0).fill().map(function(){
        return new Tree(apples, id);
    });
    Garden.list.push(this);
}

Garden.list = [];

Garden.prototype.addTree = function(apples){
    this.trees.push(new Tree(apples, this.id))
}

Garden.prototype.getAge = function(){
    return this.old;
}

Garden.prototype.getTreeList = function(){
    return this.trees;
}

Garden.prototype.getTreesCounter = function(){
    return this.trees.length;
}

Garden.prototype.getOnTreeApplesCount = function(){
    return this.getAppleList().filter(function(apple){
        return apple.onTree;
    }).length;
}

Garden.prototype.getFalledApplesCount = function(){
    return this.getAppleList().filter(function(apple){
        return !apple.onTree;
    }).length;
}

Garden.prototype.getAppleList = function(){
    var appleList = [];
    this.trees.forEach(function(tree){
        tree.apples.forEach(function(apple){
            appleList.push(apple);
        })
    })
    return appleList;
}

Garden.prototype.passDay = function(){
    this.old += 1
    this.trees.forEach(function(tree){
        tree.passDay();
    });

}

$(document).ready(function(){
    var garden;
    var render = function(){
        $('.garden_age').text(garden.old);
        $('.trees_counter').text(garden.getTreesCounter());
        $('.rotten').text(garden.rottenCounter);
        $('.falled').text(garden.getFalledApplesCount());
        $('.apples_counter').text(garden.getOnTreeApplesCount());
        $('.garden').empty()
        garden.trees.forEach(function(tree){
            var treeElem = $('<div>', {
                class: 'tree',
                css:{
                    top: tree.coords.y,
                    left: tree.coords.x,
                }
            });
            treeElem.appendTo('.garden');

            tree.apples.forEach(function(apple){
                var appleClass = !apple.onTree ? ' apple--falled': '';
                appleClass = apple.rotten ? ' apple--rotten' : appleClass;
                var apple = $('<div>', {
                    class: 'apple'+appleClass,
                    css:{
                        top: apple.coords.y,
                        left: apple.coords.x,
                    }
                })
                apple.appendTo(treeElem)


            })

        })

    }

    $('.create').on('click', function(){
        var trees = +$('#trees').val() || 10;
        var apples = +$('#apples').val() || 5;
        garden = new Garden(trees,apples);
        $('.interface__initial').hide();
        $('.garden').show();
        $('.interface__stats').show();
        $('.interface__controls').show();
        render();
    });
    $('.passDay').on('click', function(){
        garden.passDay();
        render();
    });

});
