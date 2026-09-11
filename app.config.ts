const apiUrl =
  process.env.EXPO_PUBLIC_API_URL?.trim();

const allowCleartext = apiUrl.startsWith("http://");

export default {
  expo: {
    name: "آب‌یار",
    slug: "aabyar-water-tracker",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "aabyar",
    userInterfaceStyle: "automatic",
    icon: "./assets/icon.png",
    extra: {
      eas: {
        projectId: "26d6e813-efff-4c44-ab40-e76a2785baf1",
      },
    },
    android: {
      package: "com.aabyar.watertracker",
      versionCode: 1,

      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#0A84FF",
      },
    },

    plugins: [
      "expo-secure-store",
      [
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: allowCleartext,
          },
        },
      ],
    ],
  },
};