import glob

print """
<html><head>
    <title>MUI test</title>
    <link rel="stylesheet" href="jasmine-1.0.2/jasmine.css">
    <script src="jasmine-1.0.2/jasmine.js"></script>
    <script src="jasmine-1.0.2/jasmine-html.js"></script>
    <script src="mui/xmodule.js"></script>
"""
for test in glob.glob("*.js"):
    print '<script src="' + test + '"></script>'
print """
</head><body><script>
    jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
    jasmine.getEnv().execute();
</script></body></html>
"""

