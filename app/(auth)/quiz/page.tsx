'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const QUESTIONS = [
  {
    id: 1,
    question: "Quel est ton style de trading principal ?",
    options: [
      { label: "Scalping — je prends des dizaines de trades par jour", value: "scalping" },
      { label: "Day trading — j'ouvre et ferme mes trades dans la journée", value: "daytrading" },
      { label: "Swing trading — je garde mes trades plusieurs jours", value: "swing" },
      { label: "Position trading — je garde plusieurs semaines ou mois", value: "position" },
    ]
  },
  {
    id: 2,
    question: "Qu'est-ce qui te fait le plus souvent perdre de l'argent ?",
    options: [
      { label: "Je coupe mes gains trop tôt par peur", value: "peur_gains" },
      { label: "Je laisse courir mes pertes en espérant un retournement", value: "pertes_longues" },
      { label: "Je prends une position après avoir raté un mouvement (FOMO)", value: "fomo" },
      { label: "Je revenge trade après une perte pour me refaire", value: "revenge" },
    ]
  },
  {
    id: 3,
    question: "Comment te sens-tu juste avant d'ouvrir un trade ?",
    options: [
      { label: "Très calme et méthodique — je suis mon plan", value: "calme" },
      { label: "Un peu excité mais je reste discipliné", value: "excite_discipline" },
      { label: "Souvent pressé — j'ai peur de rater l'entrée", value: "presse" },
      { label: "Stressé — je doute souvent de moi", value: "stresse" },
    ]
  },
  {
    id: 4,
    question: "Quel est ton objectif principal en trading ?",
    options: [
      { label: "Générer un revenu complémentaire régulier", value: "revenu_complementaire" },
      { label: "Devenir trader à temps plein", value: "temps_plein" },
      { label: "Passer une prop firm et trader le capital d'une firme", value: "prop_firm" },
      { label: "Faire fructifier mon épargne sur le long terme", value: "epargne" },
    ]
  },
  {
    id: 5,
    question: "Que fais-tu après une série de pertes ?",
    options: [
      { label: "Je m'arrête et j'analyse ce qui s'est passé", value: "analyse" },
      { label: "Je fais une pause et je reviens plus tard", value: "pause" },
      { label: "Je continue mais je réduis ma taille de position", value: "reduit" },
      { label: "J'essaie de récupérer rapidement", value: "recupere" },
    ]
  },
  {
    id: 6,
    question: "Est-ce que tu as un plan de trading écrit ?",
    options: [
      { label: "Oui et je le suis rigoureusement", value: "plan_strict" },
      { label: "Oui mais je m'en écarte souvent", value: "plan_loose" },
      { label: "J'en ai un dans la tête mais pas écrit", value: "plan_mental" },
      { label: "Non je trade à l'instinct", value: "instinct" },
    ]
  },
  {
    id: 7,
    question: "Combien de temps trades-tu par semaine ?",
    options: [
      { label: "Moins de 5 heures", value: "moins_5h" },
      { label: "Entre 5 et 15 heures", value: "5_15h" },
      { label: "Entre 15 et 30 heures", value: "15_30h" },
      { label: "Plus de 30 heures — c'est quasi mon travail", value: "plus_30h" },
    ]
  },
  {
    id: 8,
    question: "Quel est ton niveau d'expérience en trading ?",
    options: [
      { label: "Débutant — moins de 6 mois", value: "debutant" },
      { label: "Intermédiaire — 6 mois à 2 ans", value: "intermediaire" },
      { label: "Avancé — 2 à 5 ans", value: "avance" },
      { label: "Expert — plus de 5 ans", value: "expert" },
    ]
  },
]

function getProfile(answers: Record<number, string>) {
  const biases = []
  if (answers[2] === 'revenge') biases.push('Revenge Trading')
  if (answers[2] === 'fomo') biases.push('FOMO')
  if (answers[2] === 'pertes_longues') biases.push('Biais de perte')
  if (answers[2] === 'peur_gains') biases.push('Peur de gagner')
  if (answers[3] === 'presse') biases.push('Impatience')
  if (answers[3] === 'stresse') biases.push('Anxiété de trading')
  if (answers[5] === 'recupere') biases.push('Overtrading émotionnel')

  let score = 70
  if (answers[3] === 'calme') score += 10
  if (answers[5] === 'analyse') score += 10
  if (answers[6] === 'plan_strict') score += 10
  if (answers[3] === 'stresse') score -= 15
  if (answers[5] === 'recupere') score -= 15
  if (answers[6] === 'instinct') score -= 10
  score = Math.min(95, Math.max(30, score))

  const profiles: Record<string, string> = {
    calme: 'Trader Méthodique',
    excite_discipline: 'Trader Équilibré',
    presse: 'Trader Impulsif',
    stresse: 'Trader Anxieux',
  }

  return {
    score,
    biases: biases.length > 0 ? biases : ['Profil à définir'],
    profil: profiles[answers[3]] || 'Trader en développement',
    style: answers[1] || 'daytrading',
    objectif: answers[4] || 'revenu_complementaire',
  }
}

export default function QuizPage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<any>(null)

  const question = QUESTIONS[current]
  const progress = Math.round((current / QUESTIONS.length) * 100)

  function selectAnswer(value: string) {
    const newAnswers = { ...answers, [question.id]: value }
    setAnswers(newAnswers)

    if (current < QUESTIONS.length - 1) {
      setTimeout(() => setCurrent(current + 1), 300)
    } else {
      const profile = getProfile(newAnswers)
      setResult(profile)
    }
  }

  async function saveAndContinue() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({
        trading_style: result.style,
        objectif: result.objectif,
        psych_score: result.score,
        biases: result.biases,
        profil_type: result.profil,
      }).eq('id', user.id)
    }
    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080a0d', color: '#dfe3ed', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#00e5b0', letterSpacing: '-1px', marginBottom: '8px' }}>
            Trade<span style={{ color: '#7a8299', fontWeight: '400' }}>Mind</span>
          </div>
          <div style={{ fontSize: '16px', color: '#7a8299' }}>Découvre ton profil psychologique de trader</div>
        </div>

        {!result ? (
          <div>
            {/* Progress bar */}
            <div style={{ background: '#141920', borderRadius: '10px', height: '6px', marginBottom: '32px', overflow: 'hidden' }}>
              <div style={{ background: '#00e5b0', height: '100%', width: `${progress}%`, borderRadius: '10px', transition: 'width 0.3s ease' }} />
            </div>

            <div style={{ fontSize: '12px', color: '#7a8299', marginBottom: '16px', textAlign: 'center' }}>
              Question {current + 1} sur {QUESTIONS.length}
            </div>

            <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', marginBottom: '20px' }}>
              <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '28px', lineHeight: '1.4', textAlign: 'center' }}>
                {question.question}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {question.options.map(option => (
                  <button
                    key={option.value}
                    onClick={() => selectAnswer(option.value)}
                    style={{
                      background: answers[question.id] === option.value ? 'rgba(0,229,176,0.15)' : '#141920',
                      border: `1px solid ${answers[question.id] === option.value ? '#00e5b0' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '10px',
                      padding: '14px 18px',
                      color: answers[question.id] === option.value ? '#00e5b0' : '#dfe3ed',
                      fontSize: '14px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'sans-serif',
                      fontWeight: answers[question.id] === option.value ? '600' : '400',
                      transition: 'all 0.15s'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {current > 0 && (
              <button
                onClick={() => setCurrent(current - 1)}
                style={{ background: 'transparent', border: 'none', color: '#7a8299', fontSize: '14px', cursor: 'pointer', display: 'block', margin: '0 auto' }}
              >
                ← Question précédente
              </button>
            )}
          </div>
        ) : (
          <div>
            <div style={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', marginBottom: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#7a8299', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Ton profil psychologique</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#00e5b0', marginBottom: '8px' }}>{result.profil}</div>

              <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: `4px solid ${result.score >= 70 ? '#22d3a0' : result.score >= 50 ? '#f59e0b' : '#f05252'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '24px auto' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: result.score >= 70 ? '#22d3a0' : result.score >= 50 ? '#f59e0b' : '#f05252' }}>{result.score}</div>
                <div style={{ fontSize: '11px', color: '#7a8299' }}>/100</div>
              </div>

              <div style={{ fontSize: '13px', color: '#7a8299', marginBottom: '20px' }}>Score psychologique initial</div>
            </div>

            <div style={{ background: '#0e1117', border: '1px solid rgba(240,82,82,0.2)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>⚠️ Biais identifiés</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {result.biases.map((bias: string) => (
                  <span key={bias} style={{ background: 'rgba(240,82,82,0.1)', border: '1px solid rgba(240,82,82,0.2)', borderRadius: '6px', padding: '4px 12px', fontSize: '13px', color: '#f87171' }}>
                    {bias}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(0,229,176,0.06)', border: '1px solid rgba(0,229,176,0.2)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#00e5b0', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>💡 Ce que TradeMind va faire pour toi</div>
              <div style={{ fontSize: '13px', color: '#dfe3ed', lineHeight: '1.7' }}>
                En analysant chaque trade que tu enregistres, l'IA va suivre l'évolution de tes biais et te donner un score mis à jour en temps réel. L'objectif : transformer ton profil et améliorer ton score semaine après semaine.
              </div>
            </div>

            <button
              onClick={saveAndContinue}
              disabled={saving}
              style={{ width: '100%', background: '#00e5b0', border: 'none', borderRadius: '12px', padding: '16px', color: '#000', fontWeight: '700', fontSize: '16px', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Sauvegarde...' : 'Accéder à mon dashboard →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}