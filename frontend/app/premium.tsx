import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { createCheckout, getSession } from "../src/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const PREMIUM_PACKAGES = [
  {
    id: "premium_monthly",
    name: "Monthly",
    price: "$2.99",
    features: [
      "Better audio quality",
      "Unlimited rooms",
      "No ads",
      "Priority support",
    ],
  },
  {
    id: "premium_yearly",
    name: "Yearly",
    price: "$29.99",
    features: [
      "Better audio quality",
      "Unlimited rooms",
      "No ads",
      "Priority support",
      "Save 17%",
    ],
    popular: true,
  },
];

const PremiumScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [session, setSessionState] = React.useState<any>(null);

  React.useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    const sess = await getSession();
    setSessionState(sess);
  };

  const handleUpgrade = async (packageId: string) => {
    setLoading(true);
    try {
      const response = await createCheckout(
        session?.userId,
        packageId,
        "talkietool://premium"
      );

      // In production, redirect to Stripe checkout
      Alert.alert(
        "Upgrade",
        `Upgrading to ${packageId}...\nSession: ${response.session_id}`
      );

      setTimeout(() => {
        router.replace("/premium-success");
      }, 2000);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Premium</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <MaterialCommunityIcons
            name="crown"
            size={64}
            color="#ffd700"
          />
          <Text style={styles.heroTitle}>Go Premium</Text>
          <Text style={styles.heroDesc}>
            Unlock the full potential of TalkieTool
          </Text>
        </View>

        <View style={styles.packages}>
          {PREMIUM_PACKAGES.map((pkg) => (
            <View
              key={pkg.id}
              style={[
                styles.package,
                pkg.popular && styles.packagePopular,
              ]}
            >
              {pkg.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>POPULAR</Text>
                </View>
              )}

              <Text style={styles.packageName}>{pkg.name}</Text>
              <Text style={styles.packagePrice}>{pkg.price}</Text>
              <Text style={styles.packagePeriod}>
                {pkg.id === "premium_monthly" ? "/month" : "/year"}
              </Text>

              <View style={styles.featuresList}>
                {pkg.features.map((feature, idx) => (
                  <View key={idx} style={styles.feature}>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={18}
                      color="#16c784"
                    />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.upgradeButton,
                  pkg.popular && styles.upgradeButtonPopular,
                ]}
                onPress={() => handleUpgrade(pkg.id)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.upgradeButtonText,
                    pkg.popular && styles.upgradeButtonTextPopular,
                  ]}
                >
                  {loading ? "Processing..." : "Upgrade Now"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>FAQ</Text>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              Can I cancel anytime?
            </Text>
            <Text style={styles.faqAnswer}>
              Yes, you can cancel your subscription anytime from your account settings.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              What payment methods do you accept?
            </Text>
            <Text style={styles.faqAnswer}>
              We accept all major credit cards via Stripe.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              Is there a free trial?
            </Text>
            <Text style={styles.faqAnswer}>
              Currently, we offer a free version with basic features.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a3e",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  hero: {
    alignItems: "center",
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 16,
  },
  heroDesc: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 8,
    textAlign: "center",
  },
  packages: {
    gap: 16,
    marginBottom: 32,
  },
  package: {
    backgroundColor: "#2a2a3e",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#16c784",
  },
  packagePopular: {
    borderColor: "#ffd700",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
  },
  popularBadge: {
    backgroundColor: "#ffd700",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  packageName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  packagePrice: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#16c784",
  },
  packagePeriod: {
    fontSize: 12,
    color: "#aaa",
    marginBottom: 16,
  },
  featuresList: {
    gap: 8,
    marginBottom: 16,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#fff",
  },
  upgradeButton: {
    backgroundColor: "#16c784",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    opacity: 0.8,
  },
  upgradeButtonPopular: {
    backgroundColor: "#ffd700",
    opacity: 1,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  upgradeButtonTextPopular: {
    color: "#1a1a2e",
  },
  faqSection: {
    marginBottom: 32,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: "#2a2a3e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#16c784",
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#16c784",
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 13,
    color: "#aaa",
    lineHeight: 20,
  },
});

export default PremiumScreen;
