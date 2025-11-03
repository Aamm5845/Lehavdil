"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, Users, School } from "lucide-react";

interface Community {
  id: string;
  nameEn: string;
  nameHe?: string;
  cityId: string;
  createdAt: Date;
}

interface City {
  id: string;
  nameEn: string;
  nameHe?: string;
  country: string;
  createdAt: Date;
}

export default function CityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cityId = params.id as string;
  
  const [city, setCity] = useState<City | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch city details
        const cityRes = await fetch(`/api/cities/${cityId}`);
        if (!cityRes.ok) throw new Error("Failed to fetch city");
        const cityData = await cityRes.json();
        setCity(cityData.city);
        
        // Fetch communities
        const communitiesRes = await fetch(`/api/communities?cityId=${cityId}`);
        if (!communitiesRes.ok) throw new Error("Failed to fetch communities");
        const communitiesData = await communitiesRes.json();
        setCommunities(communitiesData.communities || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cityId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!city) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">City not found</h2>
          <button
            onClick={() => router.push("/dashboard/schools")}
            className="mt-4 text-sky-600 hover:text-sky-700"
          >
            Back to Cities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/dashboard/schools")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cities
        </button>
        
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-50">
            <Building2 className="w-8 h-8 text-sky-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{city.nameEn}</h1>
            <p className="text-slate-600">{city.country}</p>
          </div>
        </div>
      </div>

      {/* Communities Grid */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Communities in {city.nameEn}
        </h2>
        
        {communities.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <School className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">No communities found in this city</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            {communities.map((community) => (
              <motion.div
                key={community.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/dashboard/schools/${cityId}/${community.id}`)}
                className="bg-white border border-slate-200 rounded-lg p-5 cursor-pointer hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2.5 rounded-lg bg-purple-50">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-slate-900 truncate">
                      {community.nameEn}
                    </h3>
                  </div>
                </div>
                
                {community.nameHe && (
                  <p className="text-xs text-slate-600">
                    {community.nameHe}
                  </p>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}