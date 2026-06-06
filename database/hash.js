const bcrypt =
require('bcrypt');

bcrypt.hash(
'123',
10
).then(console.log);