@echo off
set executable=%1
set executable_name=%executable:~0,-4%
set result=%executable_name%.txt

if [%1] == [] (
	exit 1
) else (
	:: opening another terminal and executing program sandboxed 
	wt "C:\Program Files\Sandboxie\Start.exe" %~1 
	:: checking if the program execution is more than 10 second (searching for possible loop)
	waitfor SomethingThatIsNeverHappening /t 10 2>NUL || tasklist | grep %~1  > %result% 
	
	:: checks file size 
	for %%A in (%result%) do (
		:: removes unused file
		if %%~zA == 0 (
			exit 1
		) else (
			exit 2
		)
	)
)