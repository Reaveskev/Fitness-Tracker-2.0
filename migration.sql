DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS body_measurements CASCADE;
DROP TABLE IF EXISTS workout CASCADE;
DROP TABLE IF EXISTS quotes ;
DROP TABLE IF EXISTS workout_entries;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS food_diary CASCADE;
DROP TABLE IF EXISTS food_entries;
-- psql -f migration.sql fitness

CREATE TABLE users (
    user_id SERIAL NOT NULL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    name VARCHAR(50),
    sex TEXT,
    birth_date DATE NOT NULL,
    password TEXT NOT NULL,
    image_url VARCHAR(255)
);

-- INSERT INTO users (username, name, sex, birth_date, password)
-- VALUES ('john_doe', 'John Doe', 'Male', '1990-08-15', 'hashed_password');


CREATE TABLE body_measurements (
    measurement_id SERIAL NOT NULL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    weight DECIMAL NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INSERT INTO body_measurements (user_id, weight)
-- VALUES (1, 182);

CREATE TABLE workout (
    workout_id SERIAL NOT NULL PRIMARY KEY,
    user_id  INTEGER REFERENCES users(user_id),
    date DATE
);


CREATE TABLE workout_entries (
    entry_id SERIAL NOT NULL PRIMARY KEY,
    workout_id INTEGER REFERENCES workout(workout_id) ON DELETE CASCADE,
    exercise_id INTEGER,
    set_count INTEGER,
    rep_count INTEGER,
    weight DECIMAL,
    weight_unit VARCHAR(10)
);


CREATE TABLE quotes(
  quote_id SERIAL,
  quote VARCHAR(207),
  author VARCHAR(22) 
);


CREATE TABLE goals (
    goal_id SERIAL NOT NULL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    goal TEXT,
    goal_weight INTEGER,
    calorie_goal INTEGER
);

CREATE TABLE food_diary (
    diary_id SERIAL NOT NULL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    date DATE NOT NULL
);

CREATE TABLE food_entries (
    food_entry_id SERIAL NOT NULL PRIMARY KEY,
    diary_id INTEGER NOT NULL REFERENCES food_diary(diary_id),
    category VARCHAR(10) NOT NULL,
    food_name TEXT,
    calories DECIMAL,
    protein DECIMAL,
    fat DECIMAL,
    carbohydrate DECIMAL,
    fiber DECIMAL
);


INSERT INTO quotes(quote,author) VALUES ('If a man tells you he doesn''t lift because he doesn''t want to get too bulky, then his testicles have been removed.','Paul Carter')
,('For me, life is continuously being hungry. The meaning of life is not simply to exist, to survive, but to move ahead, to go up, to achieve, to conquer.','Arnold Schwarzenegger')
,('If you''re capable of sending a legible text message between sets, you probably aren''t working hard enough.','Dave Tate')
,('Last time I checked, lifting theory has a PR of zero.','Steve Shaw')
,('Courage doesnt always roar. Sometimes courage is the quiet voice at the end of the day saying, ''I will try again tomorrow''.','Mary Anne Radmacher')
,('Dont have $100.00 shoes and a 10 cent squat.','Louie Simmons')
,('A champion is someone who gets up when they cant.','Jack Dempsey')
,('I''m the strongest bodybuilding who ever lived, I think.','Franco Columbu')
,('There is no such thing as over training, just under nutrition and under sleeping.','The Barbarian Brothers')
,('The road to nowhere is paved with excuses.','Mark Bell')
,('I dont do this to be healthy, I do this to get big muscles.','Markus Ruhl')
,('I''m not the kind of guy who tries to run between the drops. Sometimes you gotta get a little wet to reach your destination','Erik Fankhouser')
,('Discipline is doing what you hate to do, but nonetheless doing it like you love it.','Mike Tyson')
,('Mediocre athletes that tried like hell to get good are the best coaches.','Mark Rippetoe')
,('Strength does not come from physical capacity. It comes from an indomitable will.','Mahatma Gandhi')
,('The single biggest mistake that most beginners make is putting 100% of their effort into the positive (concentric) part of the rep, while paying no attention to the negative (eccentric) segment.','Dorian Yates')
,('Most champions are built by punch the clock workouts rather than extraordinary efforts.','Dan John')
,('There''s more to life than training, but training is what puts more in your life.','Brooks Kubik')
,('There is no reason to be alive if you can''t do the deadlift!','Jon Pall Sigmarsson')
,('You are right to be wary. There is much bullshit. Be wary of me too, because I may be wrong. Make up your own mind after you evaluate all the evidence and the logic.','Mark Rippetoe')
,('I would like to be the first man in the gym business to throw out my scale. If you dont like what you see in the mirror, what difference does it make what the scale says?','Vince Gironda')
,('Don''t measure yourself by what you have accomplished, but by what you should have accomplished with your ability.','John Wooden')
,('Nothing can stop the man with the right mental attitude from achieving his goal nothing on earth can help the man with the wrong mental attitude.','Thomas Jefferson')
,('Stimulate don''t Annihilate.','Lee Haney')
,('There are no shortcuts. The fact that a shortcut is important to you means that you are a pussy.','Mark Rippetoe')
,('I believe you should train with the program you believe in. I''m out of the justify my program business follow the path that will lead you to glorious times, to quote Ramesses.','Jim Wendler')
,('Anyone under 200 pounds is a woman.','Matt Rhodes')
,('People laugh and call me lazy, while they twit around in their three-hour workout making zero progress. Sometimes, instead of what you do in the weight room, its what you dont do that will lead to success.','Jim Wendler')
,('I dont eat for taste, I eat for function.','Jay Cutler')
,('If you think lifting weights is dangerous, try being weak. Being weak is dangerous.','Bret Contreras')
,('That''s a good weight...for a small woman','Dorian Yates')
,('It''s a rare individual who lets themselves be steered by what they feel is their own passion.','Dave Tate')
,('I never think about losing.','Lou Ferrigno')
,('At the end of the day it''s not a weight contest, it''s a visual contest. And it doesn''t matter what you say you weigh, if you don''t look that big then you don''t look that big.','Dorian Yates')
,('They can crack jokes. They can sit back and analyze and criticize and make all the fun they want. But Im living my life, Im doing it. What are you doing?','Kai Greene')
,('On the Internet, everyone squats. In real life, the squat rack is always empty. You figure out what this means.','Steve Shaw')
,('I don''t feel sorry for those who lack the discipline to eat more.','JM Blakely')
,('Ive made many good friends in bodybuilding, though there are few Id trust to oil my back.','Lee Labrada')
,('The longer I train, the less and less shit I do. The less shit I do, the stronger I get. The more I emphasize recovery, the stronger I get.','Paul Carter')
,('Strength does not come from winning. Your struggles develop your strengths. When you go through hardships and decide not to surrender, that is strength.','Arnold Schwarzenegger')
,('When I go out there onstage, I want to be more than just a blocky guy who waddles onto the posing platform. I want the girls to feel something.','Tom Platz')
,('The question isnt who is going to let me its who is going to stop me.','Ayn Rand')
,('Everybody wants to be a bodybuilder but dont nobody want to lift heavy ass weights!','Ronnie Coleman')
,('Bodybuilding isnt 90 minutes in the gym. Its a lifestyle.','Lee Priest')
,('Champions arent made in the gyms. Champions are made from something they have deep inside them-a desire, a dream, a vision.','Muhammad Ali')
,('It took me 20 years of hard training to get the physique I have today. What you need is what I had belief in yourself!','Branch Warren')
,('Vision creates faith and faith creates willpower. With faith, there is no anxiety and no doubt just absolute confidence in yourself.','Arnold Schwarzenegger')
,('Being negative and lazy is a disease that leads to pain, hardships, depression, poor health, and failure. Be proactive and give a damn to achieve success!','Phil Heath')
,('Bodybuilding is much like any other sport. To be successful, you must dedicate yourself 100% to your training, diet and mental approach.','Arnold Schwarzenegger')
,('Intensity builds immensity.','Kevin Levrone')
,('The first and greatest victory is to conquer self.','Plato')
,('The pain of discipline is nothing like the pain of disappointment.','Justin Langer')
,('Discipline is built by consistently performing small acts of courage.','Robin Sharma')
,('If I want to be great I have to win the victory over myself self-discipline.','Harry S. Truman')
,('We must all suffer one of two things: the pain of discipline or the pain of regret.','Jim Rohn')
,('If I Have To Die Tonight, If This Weight Is Going To Kill Me Tonight, SO BE IT! Im Dying Where I Wanna Be','Kai Greene')
,('The best activities for your health are pumping and humping.','Arnold Schwarzenegger')
,('Discipline is the bridge between your bodybuilding goals and bodybuilding success.','Felicity Luckey')
,('I always say to myself right before a tough set in the gym, Aint nothin to it, but to do it.','Ronnie Coleman')
,('If you dont follow a good nutritional plan, youre bodybuilding with one arm behind your back.','Shawn Ray')
,('Self-discipline is about controlling your desires and impulses while staying focused on what needs to get done to achieve your goal.','Adam Sicinski')
,('Rule of thumb: Eat for what youre going to be doing and not for what you have done. Dont take in more than youre willing to burn off.','Lee Haney')
,('Bodybuilding is an art, your body is the canvas, weights are your brush and nutrition is your paint. We all have the ability to turn a self-portrait into a masterpiece.','Kai Greene')
,('Success is what comes after you stop making excuses.','Luis Galarza')
,('You can have results or excuses. Not both','Arnold Schwarzenegger')
,('When it gets difficult is often right before you succeed.','Jeffrey Walker')
,('Successful people are not gifted they just work hard, then succeed on purpose.','Unknown')
,('Success is the sum of small efforts repeated day-in and day-out.','Robert Collier')
,('If you train hard, youll not only be hard, youll be hard to beat.','Herschel Walker')
,('If you can imagine it, you can achieve it if you can dream it, you can become it.','William Arthur Ward')
,('Self-discipline is about controlling your desires and impulses while staying focused on what needs to get done to achieve your goal.','Adam Sicinski')
,('Rule of thumb: Eat for what youre going to be doing and not for what you have done. Dont take in more than youre willing to burn off.','Lee Haney')
,('Bodybuilding is an art, your body is the canvas, weights are your brush and nutrition is your paint. We all have the ability to turn a self-portrait into a masterpiece.','Kai Greene')
,('Success is what comes after you stop making excuses.','Luis Galarza')
,('You can have results or excuses. Not both','Arnold Schwarzenegger')
,('When it gets difficult is often right before you succeed.','Jeffrey Walker')
,('Successful people are not gifted they just work hard, then succeed on purpose.','Unknown')
,('If you train hard, youll not only be hard, youll be hard to beat.','Herschel Walker')
,('If you can imagine it, you can achieve it if you can dream it, you can become it.','William Arthur Ward')
,('Sometimes I feel like giving up. But then I remember I have a lot of motherfuckers to prove wrong.','Unknown')
,('You will face your greatest opposition when you are closest to your biggest miracle.','Shannon L. Alder')
,('When it comes to eating right and exercising, there is no ‘Ill start tomorrow. Tomorrow is a disease.','V.L. Allinear')
,('The fight is won or lost far away from witnesses, behind the lines, in the gym, and out there on the road, long before I dance under those lights.','Muhammad Ali')
,('Winners do what they fear.','Franco Columbu')
,('Failure is a success in progress.','Albert Einstein')
,('There is no such thing as failure, only results.','Tony Robbins')
,('People who avoid failure also avoid success.','Robert T. Kiyosaki')
,('The real workout starts when you want to stop.','Ronnie Coleman')
,('Victory isnt defined by wins and losses, its defined by effort.','Kai Greene')
,('The body always fails first, not the mind. The trick is to make the mind work for you, not against you.','Arnold Schwarzenegger')
,('Just like in bodybuilding, failure is also a necessary experience for growth in our own lives, for if were never tested to our limits, how will we know how strong we really are? How will we ever grow?','Arnold Schwarzenegger')
,('Look in the mirror. Thats your competition.','Unknown')
,('To be a champion, you must act like a champion.','Lou Ferrigno')
,('Tough times dont last. Tough people do.','Robert H. Schuller')
,('If you arent begging for rest. Then you arent training your best.','Unknown')
,('Dont wish it were easier. Wish you were better.','Jim Rohn');

