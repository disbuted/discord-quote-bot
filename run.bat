@echo off
:: Navigate to the directory where the bot is located
cd /d "C:\Users\prodc\Desktop\Shiba Quote Bot"

:: Run the bot using node
echo Starting Discord bot...
node index.js

:: Keep the window open if there is an error
echo Bot has stopped running. Press any key to exit...
pause