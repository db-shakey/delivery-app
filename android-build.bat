call del Dorrbell-armv7.apk
call ionic build android --release
call jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore "..\certificates\my-release-key.keystore" "platforms\android\build\outputs\apk\android-armv7-release-unsigned.apk" alias_name
call zipalign -v 4 "platforms\android\build\outputs\apk\android-armv7-release-unsigned.apk" Dorrbell-armv7.apk