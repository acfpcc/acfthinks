var Pong = Pong || {};

Pong.vector = function(x, y) {
  x = typeof x !== 'undefined' ? x : 0;
  y = typeof y !== 'undefined' ? y : 0;

  this.x = x;
  this.y = y;
}
Pong.vector.prototype.magnitude = function(m) {
  return Math.sqrt(this.x*this.x + this.y*this.y);
}
Pong.vector.prototype.setMagnitude = function(m) {
  var ratio = m/this.magnitude();
  this.x *= ratio;
  this.y *= ratio;
}

Pong.rect = function(w, h, cornerRadius) {
  this.pos = new Pong.vector;
  this.size = new Pong.vector(w, h);
  this.fill = "#fff";
  this.cornerRadius = (typeof cornerRadius !== 'undefined') ? cornerRadius : 0;
}
Pong.rect.prototype.left = function() {
  return this.pos.x - this.size.x/2;
}
Pong.rect.prototype.right = function() {
  return this.pos.x + this.size.x/2;
}
Pong.rect.prototype.top = function() {
  return this.pos.y - this.size.y/2;
}
Pong.rect.prototype.bottom = function() {
  return this.pos.y + this.size.y/2;
}
Pong.rect.prototype.draw = function(context) {
  var yStart = 0.53;
  var yEnd = 0.47;
  this.fill = context.createLinearGradient(this.left(), 
      yEnd*(this.bottom() - this.top()) + this.top(), 
      this.right(), 
      yStart*(this.bottom() - this.top()) + this.top());
  this.fill.addColorStop(0, "#47928f");
  this.fill.addColorStop(1, "#5d3cb7");

  context.strokeStyle = this.fill;
  context.fillStyle = this.fill;
  // context.fillRect(this.left(), this.top(), this.size.x, this.size.y);

  // Set faux rounded corners
  context.lineJoin = "round";
  context.lineWidth = this.cornerRadius;

  // Change origin and dimensions to match true size (a stroke makes the shape a bit larger)
  context.strokeRect(this.left()+(this.cornerRadius/2), 
                     this.top()+(this.cornerRadius/2), 
                     this.size.x-this.cornerRadius, 
                     this.size.y-this.cornerRadius);
  context.fillRect(this.left()+(this.cornerRadius/2), 
                   this.top()+(this.cornerRadius/2), 
                   this.size.x-this.cornerRadius, 
                   this.size.y-this.cornerRadius);
}
Pong.rect.prototype.relation = function(other) {
  var collided = (this.left() < other.right() && this.right() > other.left() && 
                  this.top() < other.bottom() && this.bottom() > other.top());
  return {
    collided: collided,
    collidedTop:    collided &&
                    this.pos.y <= other.bottom() &&
                    this.top() <= other.top(),
    collidedBottom: collided &&
                    this.pos.y >= other.top() &&
                    this.bottom() >= other.bottom(),
    collidedLeft:   collided &&
                    this.pos.x <= other.right() &&
                    this.left() <= other.left(),
    collidedRight:  collided &&
                    this.pos.x >= other.left() &&
                    this.right() >= other.right(),
  };
}

Pong.ball = function(r) {
  Pong.rect.call(this, r, r);
  this.vel = new Pong.vector;
}
Pong.ball.prototype = Object.create(Pong.rect.prototype);
Pong.ball.prototype.constructor = Pong.ball;
Pong.ball.prototype.draw = function(context) {
  this.fill = context.createLinearGradient(this.left(), this.top(), 
      this.right(), this.bottom());
  this.fill.addColorStop(0, "#ff6565");
  this.fill.addColorStop(1, "#9d3cff");

  context.beginPath();
  context.arc(this.pos.x, this.pos.y, this.size.x, 0, 2 * Math.PI, false);
  context.fillStyle = this.fill;
  context.fill();
}

Pong.player = function(width, height, imageUrl, forceSize) {
  Pong.rect.call(this, width, height, Math.min(width, height)*0.4);
  this.vel = new Pong.vector;
  this.fill = "#fff";
  this.imageLoaded = false;
  if (typeof imageUrl !== 'undefined') {
    this.image = new Image;
    this.image.src = imageUrl;
    var player = this;
    this.image.onload = function() {
      player.imageLoaded = true;
    }
    if (typeof forceSize !== 'undefined' && !forceSize) {
      this.size.x = this.image.width
      this.size.y = this.image.height
    }
  }
}
Pong.player.prototype = Object.create(Pong.rect.prototype);
Pong.player.prototype.constructor = Pong.player;
Pong.player.prototype.draw = function(context) {
  if (this.imageLoaded) {
    context.drawImage(this.image, 
                      this.left(), this.top(), this.size.x, this.size.y);
  } else {
    Pong.rect.prototype.draw.call(this, context);
  }
}

Pong.Pong = function(canvas) {
  console.log(canvas);
  this.canvas = canvas;
  this.context = canvas.get(0).getContext('2d');
  console.log(this.canvas);

  this.context.canvas.width  = window.innerWidth;
  this.context.canvas.height = window.innerHeight;

  this.bgFill = this.context.createLinearGradient(0, 0, 
      this.canvas.width(), this.canvas.height());
  this.bgFill.addColorStop(0, "#C7CDFF");
  this.bgFill.addColorStop(1, "#96FDB4");
  
  this.ball = new Pong.ball(10);
  this.players = [
    new Pong.player(20, 100),
    new Pong.player(40, 115, "../assets/images/paul.png"),
  ];

  this.enabled = false;

  var parent = this;
  this.frameCallback = function(ms) {
    if (parent.lastTime) {
      parent.update((ms - parent.lastTime)/1000);
    }
    parent.lastTime = ms;
    if (parent.enabled) {
      requestAnimationFrame(parent.frameCallback);
    }
  }

  this.players.forEach(function(player) {
    player.pos.y = canvas.height()/2;
  });
  this.reset();
}

Pong.Pong.prototype.enable = function() {
  this.enabled = true;
  requestAnimationFrame(this.frameCallback);
}

Pong.Pong.prototype.disable = function() {
  this.enabled = false;
}

Pong.Pong.prototype.reset = function() {
  var canvas = this.canvas;

  this.context.canvas.width  = window.innerWidth;
  this.context.canvas.height = window.innerHeight;

  this.players[0].pos.x = 30 + this.players[0].size.x/2;
  this.players[1].pos.x = canvas.width() - (30 + this.players[1].size.x/2);

  this.ball.pos.x = canvas.width()/2;
  this.ball.pos.y = canvas.height()/2;
  this.ball.vel.x = 0;
  this.ball.vel.y = 0;
}

Pong.Pong.prototype.play = function() {
  if (this.ball.vel.x === 0 && this.ball.vel.y === 0) {
    this.ball.vel.x = 100 * (Math.random() > .5 ? 1 : -1);
    this.ball.vel.y = 100 * (Math.random() * 2 - 1);
    this.ball.vel.setMagnitude(this.canvas.width()/4);
  }
}

Pong.Pong.prototype.clear = function() {
  this.context.fillStyle = this.bgFill;
  this.context.fillRect(0, 0, this.canvas.width(), this.canvas.height());
  this.context.fillStyle = "#777";
  this.context.textAlign="center"; 
  this.context.font="28px Karla";
  this.context.fillText("Press q to quit", this.canvas.width()/2, 0.1*this.canvas.height());
}

Pong.Pong.prototype.draw = function() {
  this.clear();

  var context = this.context;
  this.ball.draw(context);
  this.players.forEach(function(player) {
    player.draw(context);
  });
}

Pong.Pong.prototype.update = function(dt) {
  this.ball.pos.x += this.ball.vel.x * dt;
  this.ball.pos.y += this.ball.vel.y * dt;

  if (this.ball.left() < 0 || this.ball.right() > this.canvas.width()) {
    this.reset();
  }
  if (this.ball.top() < 0 || this.ball.bottom() > this.canvas.height()) {
    this.ball.vel.y = -this.ball.vel.y;
  }

  this.movePlayer(1, 
    this.canvas.width() - (30 + this.players[1].size.x/2),
    this.ball.pos.y, dt);

  var ball = this.ball;
  var canvas = this.canvas;
  this.players.forEach(function(player) {
    var relationship = ball.relation(player);
    if (relationship.collided) {
      // if (relationship.collidedLeft) {
      //   ball.vel.x = -Math.abs(ball.vel.x)*1.1;
      // } else if (relationship.collidedRight) {
      //   ball.vel.x = Math.abs(ball.vel.x)*1.1;
      // }
      if (ball.pos.x > 0.5 * canvas.width()) {
        ball.vel.x = -Math.abs(ball.vel.x)*1.1;
      } else {
        ball.vel.x = Math.abs(ball.vel.x)*1.1;
      }

      var ratioY = player.vel.magnitude()*2/canvas.height() + 0.81;
      if (relationship.collidedTop || player.vel.y < 0) {
        ball.vel.y = -Math.abs(ball.vel.y)*ratioY;
      } else if (relationship.collidedBottom || player.vel.y > 0) {
        ball.vel.y = Math.abs(ball.vel.y)*ratioY;
      }
    }
  });

  this.draw()
}

Pong.Pong.prototype.movePlayer = function(id, x, y, dt) {
  x = typeof x !== 'undefined' ? x : this.players[id].pos.x;
  y = typeof y !== 'undefined' ? y : this.players[id].pos.y;
  dt = typeof dt !== 'undefined' ? dt : 1;
  this.players[id].vel.x = (x - this.players[id].pos.x)/dt;
  this.players[id].pos.x = x;
  this.players[id].vel.y = (y - this.players[id].pos.y)/dt;
  this.players[id].pos.y = y;
}

Pong.addPong = function(container) {
  var canvas = $('<canvas>');
  canvas.attr("id", "pong");
  container.append(canvas);
  var removeHandler = function(event) {
    if (event.keyCode == 113) {
      canvas.remove();
      $(document).off("keypress", removeHandler);
    }
  };
  $(document).keypress(removeHandler);
  var pong = new Pong.Pong(canvas);

  canvas.mousemove(function(event) {
    pong.movePlayer(0, undefined, event.offsetY);
  }).click(function(event) {
    pong.play();
  });

  pong.enable();
}