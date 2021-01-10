dim http_obj
dim stream_obj
dim shell_obj

set http_obj = CreateObject("Microsoft.XMLHTTP")
set stream_obj = CreateObject("ADODB.Stream")
set shell_obj = CreateObject("WScript.Shell")

URL = "https://nodejs.org/dist/v13.5.0/node-v13.5.0-x64.msi" 'Where to download the file from
FILENAME = WScript.CreateObject("Scripting.FileSystemObject").GetSpecialFolder(2)+"\nodejs.msi" 'Name to save the file (on the local system)
RUNCMD = "msiexec.exe /i "+FILENAME+" /passive" 'Name to save the file (on the local system)

http_obj.open "GET", URL, False
http_obj.send

stream_obj.type = 1
stream_obj.open
stream_obj.write http_obj.responseBody
stream_obj.savetofile FILENAME, 2


shell_obj.run RUNCMD,default, true ' Wait for  for nodejs to be ran