/**
 * Particle System for Puppy's Magical Adventure
 * Provides visual effects for various game events
 */

class Particle {
  constructor(x, y, options = {}) {
    // Scene tag to filter drawing: 'game', 'menuAmbient', 'menuDemo'
    this.scene = options.scene || 'game';
    // Position
    this.x = x;
    this.y = y;
    
    // Initial velocity
    this.vx = options.vx || random(-1, 1);
    this.vy = options.vy || random(-1, 1);
    
    // Acceleration (gravity, etc)
    this.ax = options.ax || 0;
    this.ay = options.ay || 0;
    
    // Appearance
    this.size = options.size || random(3, 8);
    this.color = options.color || color(255, 255, 255);
    this.alpha = options.alpha || 255;
    this.initialAlpha = this.alpha; // Store initial alpha for fading effects
    
    // Physics
    this.drag = options.drag || 0.98;
    this.gravity = options.gravity || 0;
    this.gravityDirection = options.gravityDirection || 1; // 1 for down, -1 for up
    
    // Lifespan
    this.life = options.life || random(20, 60);
    this.maxLife = this.life;
    
    // Shape
    this.shape = options.shape || 'circle'; // 'circle', 'square', 'triangle', 'spark', 'star', 'line', 'ring'
    
    // Rotation
    this.rotation = options.rotation || 0;
    this.rotationSpeed = options.rotationSpeed || 0;
    
    // For rectangular particles
    this.particleWidth = options.particleWidth || (this.shape === 'rectangle' ? this.size : undefined);
    this.particleHeight = options.particleHeight || (this.shape === 'rectangle' ? this.size / 2 : undefined);
    
    // Special effects
    this.fadeMode = options.fadeMode || 'linear'; // 'linear', 'easeOut', 'easeIn', 'delay'
    this.delayFade = options.delayFade || 0.7; // At what point of life to start fading if using 'delay'
    
    // Size animation
    this.growRate = options.growRate || 0; // Size growth per second
    this.shrinkRate = options.shrinkRate || 0; // Size reduction per second
    this.minSize = options.minSize || 0.5;
    this.maxSize = options.maxSize || 40;
    this.pulsing = options.pulsing || false; // Pulsing size effect
    this.pulseFrequency = options.pulseFrequency || 0.1; // Pulsing frequency
    this.pulseAmplitude = options.pulseAmplitude || 0.3; // Pulsing amount (0-1)
    this.initialSize = this.size; // Store initial size for pulsing
    
    // For line particles
    this.length = options.length || 5;
    this.thickness = options.thickness || 2;
    
    // For trail particles 
    this.trail = options.trail || false;
    this.trailFade = options.trailFade || 0.05;
    this.trailLength = options.trailLength || 5;
    this.trailPositions = [];
    
    // Custom alpha fade rate
    this.alphaFadeRate = options.alphaFadeRate;
  }
  
  update(dt = 1/60) {
    // Apply acceleration
    this.vx += this.ax * dt;
    this.vy += this.ay * dt;
    
    // Apply gravity
    this.vy += this.gravity * this.gravityDirection * dt;
    
    // Apply drag
    this.vx *= this.drag;
    this.vy *= this.drag;
    
    // Update position
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    
    // Store position for trail (only store every few frames to improve performance)
    if (this.trail && random() < 0.2) {
      this.trailPositions.unshift({x: this.x, y: this.y, alpha: this.alpha});
      if (this.trailPositions.length > this.trailLength) {
        this.trailPositions.pop();
      }
    }
    
    // Update rotation
    this.rotation += this.rotationSpeed * dt;
    
    // Update size
    if (this.growRate !== 0) {
      this.size += this.growRate * dt;
      this.size = constrain(this.size, this.minSize, this.maxSize);
    }
    if (this.shrinkRate !== 0) {
      this.size -= this.shrinkRate * dt;
      this.size = constrain(this.size, this.minSize, this.maxSize);
    }
    
    // Apply pulsing effect
    if (this.pulsing) {
      const pulsePhase = sin(physicsClock * this.pulseFrequency * TWO_PI);
      this.size = this.initialSize * (1 + pulsePhase * this.pulseAmplitude);
    }
    
    // Update lifespan
    this.life -= dt * 60;
    
    // Update alpha based on remaining life and fade mode
    if (this.alphaFadeRate) {
      this.alpha -= this.alphaFadeRate * dt * 60;
      this.alpha = max(0, this.alpha);
    } else {
      const lifeRatio = this.life / this.maxLife;
      
      if (this.fadeMode === 'linear') {
        this.alpha = map(lifeRatio, 0, 1, 0, this.initialAlpha);
      } else if (this.fadeMode === 'easeOut') {
        this.alpha = map(lifeRatio * lifeRatio, 0, 1, 0, this.initialAlpha);
      } else if (this.fadeMode === 'easeIn') {
        this.alpha = map(sqrt(lifeRatio), 0, 1, 0, this.initialAlpha);
      } else if (this.fadeMode === 'delay') {
        if (lifeRatio < this.delayFade) {
          this.alpha = map(lifeRatio / this.delayFade, 0, 1, 0, this.initialAlpha);
        } else {
          this.alpha = this.initialAlpha;
        }
      }
    }
  }
  
  draw(cameraOffsetX = 0, sceneFilter = null) {
    if (sceneFilter && this.scene !== sceneFilter) return;
    
    // Draw trail first if enabled
    if (this.trail && this.trailPositions.length > 0) {
      noStroke();
      for (let i = 0; i < this.trailPositions.length; i++) {
        const pos = this.trailPositions[i];
        const trailAlpha = pos.alpha * (1 - i / this.trailPositions.length);
        
        if (this.color instanceof p5.Color) {
          const c = color(this.color.levels[0], this.color.levels[1], 
                         this.color.levels[2], trailAlpha * 0.5);
          fill(c);
        } else {
          fill(this.color, trailAlpha * 0.5);
        }
        
        const trailSize = this.size * (1 - i / this.trailPositions.length);
        ellipse(pos.x, pos.y, trailSize, trailSize);
      }
    }
    
    // Main particle
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    
    // Set color with alpha
    if (this.color instanceof p5.Color) {
      const c = color(this.color.levels[0], this.color.levels[1], 
                     this.color.levels[2], this.alpha);
      fill(c);
    } else {
      fill(this.color, this.alpha);
    }
    
    noStroke();
    
    // Draw shape
    if (this.shape === 'circle') {
      ellipse(0, 0, this.size, this.size);
    } else if (this.shape === 'square') {
      rectMode(CENTER);
      rect(0, 0, this.size, this.size);
    } else if (this.shape === 'triangle') {
      triangle(0, -this.size/2, 
               this.size/2, this.size/2, 
               -this.size/2, this.size/2);
    } else if (this.shape === 'spark') {
      // Draw a cross-like spark
      const halfSize = this.size / 2;
      rect(0, 0, this.size, this.size/4);
      rect(0, 0, this.size/4, this.size);
    } else if (this.shape === 'star') {
      // Draw a simple 4-point star
      const outerRadius = this.size / 2;
      const innerRadius = this.size / 4;
      
      beginShape();
      for (let i = 0; i < 8; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = i * TWO_PI / 8;
        vertex(cos(angle) * radius, sin(angle) * radius);
      }
      endShape(CLOSE);
    } else if (this.shape === 'line') {
      // Draw a line with specified length and thickness
      strokeWeight(this.thickness);
      stroke(this.color, this.alpha);
      line(0, 0, this.length, 0);
      noStroke();
    } else if (this.shape === 'ring') {
      // Draw a hollow ring
      noFill();
      strokeWeight(this.size / 5);
      stroke(this.color, this.alpha);
      ellipse(0, 0, this.size, this.size);
      noStroke();
    } else if (this.shape === 'dust') {
      // Tiny dust specks with varied opacity
      ellipse(0, 0, this.size/2, this.size/2);
    } else if (this.shape === 'rectangle') {
      rectMode(CENTER);
      rect(0, 0, this.particleWidth, this.particleHeight);
    }
    
    pop();
  }
  
  isDead() {
    return this.life <= 0 || this.alpha <= 0;
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }
  
  addParticle(x, y, options = {}) {
    this.particles.push(new Particle(x, y, options));
  }
  
  createBurst(x, y, count, options = {}) {
    for (let i = 0; i < count; i++) {
      const angle = random(TWO_PI);
      const speed = options.speed || random(1, 3);
      const particleOptions = {
        ...options,
        vx: cos(angle) * speed,
        vy: sin(angle) * speed
      };
      this.addParticle(x, y, particleOptions);
    }
  }
  
  createDirectionalBurst(x, y, count, angle, spread, options = {}) {
    for (let i = 0; i < count; i++) {
      const particleAngle = angle + random(-spread/2, spread/2);
      const speed = options.speed || random(1, 3);
      const particleOptions = {
        ...options,
        vx: cos(particleAngle) * speed,
        vy: sin(particleAngle) * speed
      };
      this.addParticle(x, y, particleOptions);
    }
  }
  
  createCoin(x, y, options = {}) {
    // Golden sparkle burst
    const sparkCount = 15;
    const goldColor = color(255, 215, 0);
    const brightGold = color(255, 235, 100);
    
    // Small bright inner particles
    for (let i = 0; i < sparkCount/2; i++) {
      const angle = random(TWO_PI);
      const speed = random(0.5, 2.5);
      
      this.addParticle(x, y, {
        vx: cos(angle) * speed,
        vy: sin(angle) * speed,
        color: brightGold,
        life: random(20, 40),
        size: random(2, 4),
        gravity: 0.02,
        shape: 'star',
        fadeMode: 'easeOut',
        rotationSpeed: random(-0.2, 0.2)
      });
    }
    
    // Expanding golden rings
    for (let i = 0; i < 3; i++) {
      this.addParticle(x, y, {
        vx: 0,
        vy: 0,
        color: goldColor,
        life: 30 + i * 10,
        size: 5,
        growRate: 2,
        shape: 'ring',
        fadeMode: 'delay',
        delayFade: 0.5
      });
    }
    
    // Small dust particles that float away
    for (let i = 0; i < 8; i++) {
      const angle = random(TWO_PI);
      const speed = random(0.2, 1);
      
      this.addParticle(x, y, {
        vx: cos(angle) * speed,
        vy: sin(angle) * speed,
        color: goldColor,
        life: random(40, 80),
        size: random(1, 2),
        gravity: 0.01,
        shape: 'dust',
        fadeMode: 'linear',
        drag: 0.99
      });
    }
  }
  
  createGravityFlip(x, y, width, direction, options = {}) {
    const primaryColor = color(80, 180, 255); // Blue
    const accentColor = color(160, 220, 255); // Light blue
    const trailColor = color(220, 240, 255); // Very light blue
    
    // Determine scene for demo vs game
    const sceneTag = options.scene || 'game';
    // Create main direction indicator particles
    const directionAngle = direction > 0 ? -HALF_PI : HALF_PI;
    
    // Directional arrow-like bursts
    for (let i = 0; i < 2; i++) {
      this.createDirectionalBurst(
        x + random(-width/3, width/3),
        y,
        8,
        directionAngle,
        PI/6,
        {
          scene: sceneTag,
          color: primaryColor,
          life: random(30, 50),
          size: random(3, 6),
          shape: 'triangle',
          rotationSpeed: random(-0.05, 0.05),
          speed: random(1.5, 3.5),
          gravity: 0.01,
          gravityDirection: direction,
          fadeMode: 'easeOut'
        }
      );
    }
    
    // Create small sparkles along player width
    for (let i = 0; i < 15; i++) {
      const offsetX = random(-width/2, width/2);
      const sparkAngle = directionAngle + random(-PI/4, PI/4);
      const speed = random(1, 3);
      
      this.addParticle(x + offsetX, y, {
        scene: sceneTag,
        vx: cos(sparkAngle) * speed,
        vy: sin(sparkAngle) * speed,
        color: accentColor,
        life: random(20, 40),
        size: random(2, 4),
        shape: 'spark',
        rotationSpeed: random(-0.2, 0.2),
        gravity: 0.03,
        gravityDirection: direction,
        fadeMode: 'linear'
      });
    }
    
    // Create expanding ring effect
    for (let i = 0; i < 3; i++) {
      this.addParticle(x, y, {
        scene: sceneTag,
        color: trailColor,
        life: 20 + i * 5,
        size: 10 + i * 5,
        growRate: 3,
        shape: 'ring',
        fadeMode: 'delay',
        delayFade: 0.3
      });
    }
    
    // Add a few trailing particles
    for (let i = 0; i < 8; i++) {
      const offsetX = random(-width/2, width/2);
      const trailAngle = directionAngle + random(-PI/6, PI/6);
      const speed = random(0.5, 1.5);
      
      this.addParticle(x + offsetX, y, {
        scene: sceneTag,
        vx: cos(trailAngle) * speed,
        vy: sin(trailAngle) * speed,
        color: trailColor,
        life: random(30, 60),
        size: random(1, 3),
        shape: 'dust',
        gravity: 0.01,
        gravityDirection: direction,
        trail: true,
        trailLength: 3,
        fadeMode: 'easeOut',
        drag: 0.96
      });
    }
  }
  
  createDeath(x, y, options = {}) {
    const primaryColor = color(255, 60, 60); // Bright red
    const secondaryColor = color(200, 30, 30); // Darker red
    const smokeColor = color(100, 30, 30, 180); // Dark reddish smoke
    
    // Intense explosion burst
    for (let i = 0; i < 20; i++) {
      const angle = random(TWO_PI);
      const speed = random(2, 5);
      const size = random(6, 12);
      
      this.addParticle(x, y, {
        vx: cos(angle) * speed,
        vy: sin(angle) * speed,
        color: primaryColor,
        life: random(30, 50),
        size: size,
        shrinkRate: size/10,
        gravity: 0.1,
        shape: 'circle',
        fadeMode: 'easeOut'
      });
    }
    
    // Secondary, slower particles
    for (let i = 0; i < 15; i++) {
      const angle = random(TWO_PI);
      const speed = random(0.5, 2);
      
      this.addParticle(x, y, {
        vx: cos(angle) * speed,
        vy: sin(angle) * speed,
        color: secondaryColor,
        life: random(40, 80),
        size: random(3, 8),
        gravity: 0.05,
        shape: random() > 0.5 ? 'circle' : 'square',
        fadeMode: 'easeOut',
        rotationSpeed: random(-0.1, 0.1)
      });
    }
    
    // Rising smoke effect
    for (let i = 0; i < 10; i++) {
      const offsetX = random(-10, 10);
      const offsetY = random(-10, 10);
      
      this.addParticle(x + offsetX, y + offsetY, {
        vx: random(-0.5, 0.5),
        vy: random(-1, -0.2),
        color: smokeColor,
        life: random(60, 100),
        size: random(8, 15),
        growRate: random(0.1, 0.3),
        shape: 'circle',
        fadeMode: 'delay',
        delayFade: 0.3,
        drag: 0.98
      });
    }
    
    // Spark trails
    for (let i = 0; i < 8; i++) {
      const angle = random(TWO_PI);
      const speed = random(1, 3);
      
      this.addParticle(x, y, {
        vx: cos(angle) * speed,
        vy: sin(angle) * speed,
        color: color(255, 200, 50),
        life: random(30, 50),
        size: random(1.5, 3),
        gravity: 0.15,
        shape: 'spark',
        trail: true,
        trailLength: 5,
        fadeMode: 'linear'
      });
    }
  }
  
  createExitGate(x, y, options = {}) {
    const portalColor = color(0, 220, 180); // Teal
    const energyColor = color(120, 255, 220); // Light teal
    const sparkColor = color(220, 255, 255); // White-teal
    
    // Create expanding ring waves
    for (let i = 0; i < 5; i++) {
      const delay = i * 5;
      
      this.addParticle(x, y, {
        color: portalColor,
        life: 30 + delay,
        size: 10,
        growRate: 4,
        shape: 'ring',
        fadeMode: 'delay',
        delayFade: 0.4
      });
    }
    
    // Create energy beams radiating outward
    const beamCount = 12;
    for (let i = 0; i < beamCount; i++) {
      const angle = (i / beamCount) * TWO_PI;
      const speed = 1.5;
      
      this.addParticle(x, y, {
        vx: cos(angle) * speed,
        vy: sin(angle) * speed,
        color: energyColor,
        life: random(30, 50),
        shape: 'line',
        length: random(8, 15),
        thickness: random(1, 2),
        rotation: angle,
        fadeMode: 'easeOut'
      });
    }
    
    // Add some orbital particles that circle around
    for (let i = 0; i < 20; i++) {
      const angle = random(TWO_PI);
      const radius = random(5, 25);
      const orbitSpeed = random(0.05, 0.15) * (random() > 0.5 ? 1 : -1);
      const startX = x + cos(angle) * radius;
      const startY = y + sin(angle) * radius;
      
      this.addParticle(startX, startY, {
        ax: -sin(angle) * orbitSpeed * radius,
        ay: cos(angle) * orbitSpeed * radius,
        vx: -sin(angle) * orbitSpeed * radius,
        vy: cos(angle) * orbitSpeed * radius,
        color: portalColor,
        life: random(30, 60),
        size: random(1.5, 3),
        shape: 'circle',
        fadeMode: 'easeIn',
        pulsing: true,
        pulseFrequency: random(0.1, 0.2),
        pulseAmplitude: 0.3
      });
    }
    
    // Add light sparkles
    for (let i = 0; i < 15; i++) {
      const angle = random(TWO_PI);
      const speed = random(0.5, 2);
      const distance = random(5, 30);
      
      this.addParticle(x + cos(angle) * distance, y + sin(angle) * distance, {
        vx: cos(angle) * speed,
        vy: sin(angle) * speed,
        color: sparkColor,
        life: random(20, 40),
        size: random(1, 3),
        shape: 'star',
        fadeMode: 'linear',
        pulsing: true
      });
    }
  }
  
  createFrozenEffect(x, y, width, height, options = {}) {
    const iceColor = color(210, 240, 255);
    const frostColor = color(230, 250, 255);
    const mistColor = color(200, 230, 255, 150);
    
    // Create frost burst
    for (let i = 0; i < 20; i++) {
      const offsetX = random(-width/2, width/2);
      const offsetY = random(-height/2, height/2);
      const angle = random(TWO_PI);
      const speed = random(0.2, 1);
      
      this.addParticle(x + offsetX, y + offsetY, {
        vx: cos(angle) * speed,
        vy: sin(angle) * speed,
        color: frostColor,
        life: random(40, 80),
        size: random(1.5, 3.5),
        gravity: 0,
        shape: random() > 0.6 ? 'square' : 'star',
        rotationSpeed: random(-0.05, 0.05),
        fadeMode: 'easeOut',
        drag: 0.98
      });
    }
    
    // Create mist cloud
    for (let i = 0; i < 8; i++) {
      const offsetX = random(-width/2, width/2);
      const offsetY = random(-height/2, height/2);
      
      this.addParticle(x + offsetX, y + offsetY, {
        vx: random(-0.3, 0.3),
        vy: random(-0.3, 0.3),
        color: mistColor,
        life: random(50, 100),
        size: random(8, 15),
        growRate: 0.2,
        shape: 'circle',
        fadeMode: 'delay',
        delayFade: 0.3,
        drag: 0.99
      });
    }
    
    // Create ice crystal patterns
    for (let i = 0; i < 3; i++) {
      this.addParticle(x, y, {
        color: iceColor,
        life: 40 + i * 15,
        size: 15 + i * 10,
        growRate: 1,
        shape: 'ring',
        fadeMode: 'delay',
        delayFade: 0.5
      });
    }
    
    // Create sparkling ice dust
    for (let i = 0; i < 15; i++) {
      const angle = random(TWO_PI);
      const distance = random(width/4, width/2);
      
      this.addParticle(x + cos(angle) * distance, y + sin(angle) * distance, {
        vx: cos(angle) * 0.2,
        vy: sin(angle) * 0.2,
        color: frostColor,
        life: random(30, 60),
        size: random(1, 2),
        shape: 'star',
        fadeMode: 'linear',
        pulsing: true,
        pulseFrequency: 0.2
      });
    }
  }
  
  createWallHit(x, y, direction, options = {}) {
    const dustColor = color(200, 200, 200, 180);
    const impactColor = color(255, 255, 255);
    const angle = direction > 0 ? 0 : PI; // Right or left
    
    // Tag wall hit particles for demo vs game scenes
    const sceneTag = options.scene || 'game';
    
    // Create impact marks
    for (let i = 0; i < 2; i++) {
      this.addParticle(x, y, {
        scene: sceneTag,
        color: impactColor,
        life: 10 + i * 5,
        size: 5 + i * 3,
        growRate: 0.8,
        shape: 'ring',
        fadeMode: 'linear'
      });
    }
    
    // Create dust particles
    this.createDirectionalBurst(
      x, 
      y, 
      15, 
      angle, 
      PI/2, 
      {
        scene: sceneTag,
        color: dustColor,
        life: random(20, 40),
        size: random(3, 7),
        shape: 'circle',
        speed: random(0.5, 2),
        gravity: 0.05,
        fadeMode: 'easeOut',
        drag: 0.96
      }
    );
    
    // Create spark trails
    for (let i = 0; i < 8; i++) {
      const sparkAngle = angle + random(-PI/4, PI/4);
      const speed = random(2, 4);
      
      this.addParticle(x, y, {
        scene: sceneTag,
        vx: cos(sparkAngle) * speed,
        vy: sin(sparkAngle) * speed - random(0.5, 1.5), // Add upward component
        color: color(255, 220, 180),
        life: random(15, 30),
        size: random(1, 2),
        shape: 'spark',
        gravity: 0.15,
        fadeMode: 'linear'
      });
    }
    
    // Create small impact debris chunks
    for (let i = 0; i < 5; i++) {
      const debrisAngle = angle + random(-PI/5, PI/5);
      const speed = random(1, 3);
      
      this.addParticle(x, y, {
        scene: sceneTag,
        vx: cos(debrisAngle) * speed,
        vy: sin(debrisAngle) * speed - random(1, 3), // Add upward component
        color: color(150, 140, 130),
        life: random(20, 40),
        size: random(2, 4),
        shape: 'square',
        gravity: 0.2,
        rotationSpeed: random(-0.2, 0.2),
        fadeMode: 'easeOut'
      });
    }
  }
  
  createLandingEffect(x, y, width, gravityDirection, options = {}) {
    const dustColor = color(200, 200, 200, 150); // Slightly transparent dust
    const impactColor = color(255, 255, 255, 200);
    
    // Tag landing effect particles
    const sceneTag = options.scene || 'game';
    // Create small impact ring
    this.addParticle(x, y, {
      scene: sceneTag,
      color: impactColor,
      life: 15,
      size: 6,
      growRate: 0.6,
      shape: 'ring',
      fadeMode: 'linear'
    });
    
    // Determine direction based on gravity
    const burstAngle = gravityDirection > 0 ? HALF_PI : -HALF_PI;
    
    // Create horizontal dust particles spreading outward
    for (let i = 0; i < 10; i++) {
      const spreadAngle = random(-PI * 0.8, PI * 0.8);
      const offsetX = random(-width/2, width/2) * 0.7; // Stay within player width
      
      this.addParticle(x + offsetX, y + (gravityDirection * 5), {
        scene: sceneTag,
        vx: cos(spreadAngle) * random(0.3, 1.5),
        vy: sin(spreadAngle) * random(0.3, 1.2) * gravityDirection,
        color: dustColor,
        life: random(15, 30),
        size: random(2, 4),
        shape: 'circle',
        gravity: 0.02,
        fadeMode: 'easeOut',
        drag: 0.97
      });
    }
    
    // Create a few tiny particles that bounce slightly
    for (let i = 0; i < 5; i++) {
      const offsetX = random(-width/3, width/3);
      
      this.addParticle(x + offsetX, y + (gravityDirection * 5), {
        scene: sceneTag,
        vx: random(-1, 1),
        vy: -random(0.5, 1.2) * gravityDirection, // Tiny bounce opposite to gravity
        color: color(180, 175, 160),
        life: random(12, 25),
        size: random(1, 2),
        shape: 'square',
        gravity: 0.1,
        rotationSpeed: random(-0.1, 0.1),
        fadeMode: 'linear'
      });
    }
  }
  
  createWindParticles(camera) {
    const numParticles = 5; // Increased for better coverage
    for (let i = 0; i < numParticles; i++) {
      const viewWorldX = camera.x - (window.width / 2 / camera.zoom);
      const viewWorldY = camera.y - (window.height / 2 / camera.zoom);
      const viewWorldWidth = window.width / camera.zoom;
      const viewWorldHeight = window.height / camera.zoom;

      // Spawn particles across the entire view width, plus some buffer for continuous effect
      const spawnX = viewWorldX + random(-viewWorldWidth * 0.1, viewWorldWidth * 1.1); 
      const spawnY = viewWorldY + random(viewWorldHeight);
      
      // Determine color distribution: majority green, small yellow, rare white
      const randColorType = random();
      const whiteThreshold = 0.05;
      const yellowThreshold = 0.20;
      let partColor;
      let particleSize = random(4, 10);
      if (randColorType < whiteThreshold) {
        partColor = color(255, 255, 255);
        particleSize = random(3, 8); // Slightly smaller for white particles
      } else if (randColorType < yellowThreshold) {
        partColor = color(random(150, 255), random(150, 255), random(0, 150)); // Dark to light yellow
      } else {
        partColor = color(random(50, 150), random(180, 255), random(50, 150)); // Dark to light green
      }
      const particleOptions = {
        vx: random(5, 15),
        vy: random(-2, 2),
        color: partColor,
        alpha: random(80, 150),
        life: random(100, 250),
        particleWidth: particleSize,
        particleHeight: particleSize,
        shape: 'rectangle',
        gravity: 0,
        drag: 0.995,
        rotation: random(TWO_PI),
        rotationSpeed: random(-0.05, 0.05),
        fadeMode: 'linear'
      };
      this.addParticle(spawnX, spawnY, particleOptions);
    }
  }
  
  createMenuAmbience() {
    const numParticles = 1; // Create one particle per call, relies on frequent calls
    for (let i = 0; i < numParticles; i++) {
      const x = random(window.width);
      const y = random(window.height);

      const particleShape = random(['circle', 'dust']);
      let particleColor;
      if (random() < 0.7) { // 70% chance for blues/lavenders
        particleColor = color(random(150, 200), random(150, 200), 255, random(60, 120));
      } else { // 30% chance for bright whites
        particleColor = color(230, 230, 255, random(80, 150));
      }

      const particleOptions = {
        scene: 'menuAmbient',
        vx: random(-0.3, 0.3),          // Slow horizontal drift
        vy: random(-0.5, -0.1),          // Gentle upward movement
        color: particleColor,
        alpha: particleShape === 'spark' ? random(100,180) : undefined, // Sparks can be brighter
        life: random(500, 1200),          // Longer lifespan
        size: random(9.0, 13.5),
        shape: particleShape,
        gravity: 0,
        drag: 0.992,                     // High drag for floaty feel
        pulsing: true,
        pulseFrequency: random(0.03, 0.08),
        pulseAmplitude: random(0.2, 0.4),
        fadeMode: 'easeOut',
        rotationSpeed: particleShape === 'spark' ? random(-0.02, 0.02) : 0,
      };
      this.addParticle(x, y, particleOptions);
    }
  }
  
  update(dt = 1/60) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  draw(cameraOffsetX = 0, sceneFilter = 'game') {
    for (let particle of this.particles) {
      particle.draw(cameraOffsetX, sceneFilter);
    }
  }
  
  clear() {
    this.particles = [];
  }
  
  getCount() {
    return this.particles.length;
  }
}

// Create and export a single instance for the game to use
export const particleSystem = new ParticleSystem(); 