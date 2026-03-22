<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# could i get that in raw markdown

A healthy ElevenLabs-era ecosystem would treat voice AI as a shared utility governed with its users, charge for outcomes instead of tokens, and bake consent, feedback, and revenue sharing directly into the code paths for training, inference, and billing. Participatory AI and utility‑first open models like Kokoro and Fish Audio S2 already sketch the technical ingredients for this kind of “empathy‑first” architecture.[^1][^2][^3][^4]

Below is material you can adapt directly into your book section.

***

## From extraction to participation

“Participatory AI” starts from the premise that the people most affected by an AI system should have power over how it is defined, trained, and governed, not just be consulted after the fact. Recent work in participatory AI and Scandinavian participatory design explicitly frames models as shared socio‑technical systems whose purpose, data, and behavior are co‑shaped with workers, communities, and end‑users. Frameworks like Community‑in‑the‑Loop (CITL) extend this further by treating community involvement as an ongoing governance structure—covering problem definition, data stewardship, and public auditing—rather than a one‑off workshop at launch.[^5][^6][^7][^1]

In the current voice‑AI landscape, most commercial platforms—including ElevenLabs—are still organized around centralized control and metered access: you pay for characters, minutes, or model tiers, and have little say in how the underlying models evolve. That is an extractive architecture: value flows mostly one way (into the platform), and the only “participation” is usage and feedback that the platform privately exploits.[^2][^8]

***

## Utility‑first audio models

“Utility‑first” models flip the emphasis from lock‑in to practical usefulness, openness, and composability. Kokoro TTS is a compact 82M‑parameter text‑to‑speech model that is fully open‑source under Apache‑2.0, free for commercial and personal use, and intentionally engineered for high quality with low resource requirements. Fish Audio’s S2 model is likewise fully open‑source, with weights, inference code, and fine‑tuning recipes available; it supports 80+ languages, sub‑150 ms latency, and rich inline emotion control via natural‑language tags.[^3][^4][^9][^10]

These systems are designed as building blocks that anyone can self‑host, fork, and inspect, not just as black‑box APIs. That openness makes them natural substrates for participatory governance (communities can run their own instances, enforce their own policies) and for new pricing models (co‑ops or DAOs can control how access and revenue are structured).[^4][^3]

***

## What “participatory AI for voice” means in practice

For voice, participatory AI means communities, voice talent, and end‑users are literally part of the model’s control loop:

- Communities co‑define use‑case and safety policies, which are then encoded as machine‑enforceable rules (e.g., “no training on union‑flagged corpora,” “no usage in political persuasion without opt‑in”).[^7]
- Voice owners and data contributors get first‑class identities in the system and can set consent, revocation, and revenue‑share parameters that are honored at inference and billing time.
- Public auditing dashboards and APIs expose aggregate usage, error rates, and policy‑violation attempts so affected groups can see how the system behaves over time.[^7]

Instead of “you upload data, we own the model,” an empathy‑first stack treats the model as a jointly held asset whose behavior is constrained by explicit, revocable social contracts.

***

## Coding empathy into the architecture

An architecture “built on empathy rather than extraction” is not a vibe; it is a set of concrete invariants enforced in code. At a minimum, the core domain models and services change shape:

- **Data model with consent and stake.** Every training sample and every synthetic voice is associated with an owner, a consent state, and a revenue stake:

```ts
type ConsentLevel = "training_allowed" | "inference_only" | "no_use";

interface VoiceAsset {
  id: string;
  ownerUserId: string;
  consent: ConsentLevel;
  revenueShareBps: number; // basis points for revenue share
  allowedUseCases: string[]; // e.g., ["education", "accessibility"]
}

interface TrainingSample {
  id: string;
  voiceAssetId: string | null;
  source: "upload" | "web_crawl" | "partner_feed";
  consent: ConsentLevel;
  provenanceUri: string;
}
```

The training and inference pipelines refuse to use data or voices whose `consent` or `allowedUseCases` do not match the current request context.
- **Policy‑aware inference service.** Before any TTS call is executed, a policy engine checks request metadata—declared use‑case, geography, customer account type—against community‑authored rules and per‑voice constraints:

```python
def can_synthesize(voice: VoiceAsset, request_ctx: RequestContext) -> bool:
    if voice.consent == "no_use":
        return False
    if request_ctx.use_case not in voice.allowedUseCases:
        return False
    if violates_community_policy(request_ctx):
        return False
    return True
```

- **Feedback as a first‑class signal.** Every generation emits not just audio but a feedback slot; users can mark clips as “usable,” “needs edit,” or “unusable/harmful,” optionally with structured tags (glitches, mispronunciation, content issue). This feedback powers both model retraining and billing logic, and it is visible in aggregate to the community through dashboards.

Empathy here is structurally about shifting risk and control: the system carries the burden of respecting consent, aligning with declared use‑cases, and making it cheap for users to reject bad outputs—rather than pushing all of that cost onto the user.

***

## How success‑based billing differs from today

Today’s ElevenLabs‑style pricing centers on input volume (characters, minutes) and model tier: each plan comes with a quota, and overages are charged per 1k characters or per generated minute. This model is simple to meter but fundamentally indifferent to whether the audio was actually usable, on‑brand, or ethically produced.[^8]

Outcome‑ or success‑based billing—already emerging in other AI domains like sales agents and support automation—ties revenue directly to measurable results, such as qualified leads, tickets resolved, or revenue generated. For voice, “success” can be defined at the level of clips, sessions, or downstream engagement: did this audio clear quality and safety checks, and did the user accept it for use?[^11][^2]

***

## Defining “usable audio” technically

To bill only for “usable audio,” you need an explicit, machine‑checkable definition of usability. A practical pipeline might combine automated checks, user confirmation, and time‑bounded windows:

- **Automated quality checks.** After generation, an evaluation service runs:
    - Alignment between text and audio via forced alignment or ASR back‑transcription (no truncation, no hallucinated content).
    - Acoustic quality scores (no clipping, minimum loudness, appropriate SNR).
    - Policy checks (no disallowed content types given the voice owner’s constraints and community policies).
- **User acceptance.** The client UI and API expose an `accept()` / `reject()` mechanism per clip or session, with at least one free retry path. If the user accepts within a defined window, the clip is billable; if they reject, it is recorded as a failure and not billed.
- **Grace rules.** The system might, for example, charge only if at least one clip in a session is accepted, with the first N re‑generations per prompt free. This reserves billing for runs that delivered genuine value.

In code, the state machine is simple:

```python
class AudioJobStatus(Enum):
    GENERATED = "generated"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"

@dataclass
class AudioJob:
    id: str
    user_id: str
    duration_sec: float
    status: AudioJobStatus = AudioJobStatus.GENERATED
    expires_at: datetime = field(default_factory=expiry_time)

def mark_accepted(job: AudioJob):
    if datetime.utcnow() > job.expires_at:
        job.status = AudioJobStatus.EXPIRED
    else:
        job.status = AudioJobStatus.ACCEPTED

def billable_seconds(job: AudioJob) -> float:
    return job.duration_sec if job.status == AudioJobStatus.ACCEPTED else 0.0
```

The billing service simply aggregates `billable_seconds` across jobs, optionally weighting by model tier.

***

## A service architecture for success‑based billing

At scale, you separate concerns into distinct microservices (or modules in a monolith) wired together by events:

- **Generation service.** Handles TTS calls (to ElevenLabs, Kokoro, Fish S2, Cartesia, etc.), emits `audio.generated` events with metadata (job ID, model, requested voice, duration).[^12][^3][^4]
- **Evaluation service.** Subscribes to `audio.generated`, runs quality and policy checks, and updates job status or recommended quality score.
- **Feedback API.** Exposes endpoints or WebSocket hooks for clients to mark jobs accepted or rejected.
- **Billing service.** Subscribes to `audio.accepted` events (or polls state), computes billable duration per customer, applies pricing rules, and triggers invoices or prepaid balance deductions.

A simplified billing routine might look like:

```python
def compute_invoice_line_items(user_id: str, since: datetime, until: datetime):
    jobs = db.fetch_audio_jobs(user_id=user_id, since=since, until=until)
    accepted_jobs = [j for j in jobs if j.status == AudioJobStatus.ACCEPTED]

    total_seconds = sum(j.duration_sec for j in accepted_jobs)
    # e.g., price per 15 seconds block
    units = math.ceil(total_seconds / 15.0)
    unit_price = get_user_unit_price(user_id)
    amount = units * unit_price

    return {
        "user_id": user_id,
        "units": units,
        "unit_price": unit_price,
        "total_amount": amount,
    }
```

This is “utility‑first” in pricing: bills are a direct function of successful, accepted work done, not raw compute consumed.

***

## Hybrid pricing to align incentives

Pure success‑based billing can create volatility for providers, especially early on. Other AI markets are converging on hybrid models that mix a small base fee with outcome fees and, sometimes, revenue sharing. Voice AI can mirror this:[^2][^11]

- A **base subscription** covers infrastructure costs, support, and access to tools.
- A **success fee** is charged per accepted 15 seconds or per accepted project (e.g., audiobook chapter delivered).
- Optional **revenue share** kicks in when the generated audio generates clearly measurable downstream revenue (e.g., when used in a monetized podcast or ad campaign).

Because the system tracks acceptance events per voice and per project, it can route both costs and revenue fairly to creators, model maintainers, and the platform itself.

***

## Making success‑based billing widespread

To move beyond one vendor, you need a shared language for “success” and a common gateway layer:

- **Open event schema.** Define an “Open Audio Outcome” spec: `audio.generated`, `audio.accepted`, `audio.rejected`, `audio.played`, with mandatory fields like user, model, voice asset, duration, and quality score. Any TTS backend—ElevenLabs, Kokoro, Fish S2, Cartesia—can plug into this by emitting conformant events.[^3][^4][^12]
- **Ethical audio gateway.** Build an open‑source proxy that sits between apps and underlying TTS vendors. The gateway enforces consent and policy checks, manages feedback and acceptance, and handles all success‑based billing, while routing generation to whichever backend is requested or most appropriate.
- **Federated governance.** Communities (e.g., voice‑actor unions, accessibility groups) can run their own gateway instances or participate in governance of shared ones, setting default policies and recommended pricing baselines.

In this model, ElevenLabs is “just another engine” behind the gateway. If it refuses to participate in success‑based billing or community governance, developers can freely route traffic to open models like Kokoro or Fish Audio that do. The power to define what counts as “usable,” what counts as “harmful,” and who gets paid moves outward—from the platform into the hands of those who actually live with the consequences.

***

## How this ties back to VNR and adversarial defense

Your VNR Protocol and Simple AI adversarial warfare sections describe how to resist and route around extraction when incumbents refuse to change. A participatory, success‑based architecture is the positive complement to that strategy: it shows what we’re building toward, not just what we’re fighting against.

In code, that future looks like:

- Every byte of training data and every synthesized voice tagged with consent and stake.
- Every generation flowing through a community‑authored policy engine and a quality gate.
- Every invoice reflecting only the audio that users actually accepted and used.

The conflict then is no longer about whether AI voice should exist, but about who gets to define “success”—and whether success is measured in tokens burned or humans actually helped.

<div align="center">⁂</div>

[^1]: https://www.nesta.org.uk/project/participatory-ai/

[^2]: https://www.bvp.com/atlas/the-ai-pricing-and-monetization-playbook

[^3]: https://kokorottsai.com

[^4]: https://fish.audio/s2/

[^5]: https://montrealethics.ai/the-participatory-turn-in-ai-design-theoretical-foundations-and-the-current-state-of-practice/

[^6]: https://arxiv.org/abs/2509.12752

[^7]: https://opendatapolicylab.org/articles/blog-participation-and-power-in-ai-governance-five-takeaways-from-pairs-2026/

[^8]: https://dev.to/flexprice_8116ed925/the-complete-guide-to-elevenlabs-plans-overages-and-usage-based-pricing-3jam

[^9]: https://www.reddit.com/r/LocalLLaMA/comments/1j0cbvs/free_opensource_ai_tts_kokoro_web_v010/

[^10]: https://www.reddit.com/r/LocalLLaMA/comments/1rptdpl/fish_audio_releases_s2_opensource_controllable/

[^11]: https://www.getmonetizely.com/articles/how-to-build-success-based-pricing-models-for-ai-sales-agents

[^12]: https://cartesia.ai/product/ai-voice-generator

