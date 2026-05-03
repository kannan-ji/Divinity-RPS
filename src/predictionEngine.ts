export type Choice = 'rock' | 'paper' | 'scissors';

export const CHOICES: Choice[] = ['rock', 'paper', 'scissors'];

export const BEATS: Record<Choice, Choice> = {
  rock: 'scissors',
  paper: 'rock',
  scissors: 'paper',
};

export const BEATEN_BY: Record<Choice, Choice> = {
  rock: 'paper',
  paper: 'scissors',
  scissors: 'rock',
};

export interface GameHistory {
  playerMove: Choice;
  npcMove: Choice;
  result: 'win' | 'loss';
}

export class PredictionEngine {
  private history: GameHistory[] = [];

  recordActualOutcome(playerMove: Choice, npcMove: Choice) {
    let result: 'win' | 'loss';
    if (BEATS[playerMove] === npcMove) result = 'win';
    else result = 'loss';

    this.history.push({ playerMove, npcMove, result });
  }

  getHistory() {
    return this.history;
  }

  clearHistory() {
    this.history = [];
  }

  predictNpcResponse(intendedPlayerMove: Choice): { prediction: Choice; confidence: number; strategy: string } {
    if (this.history.length === 0) {
      // First round: Many players start with Rock, NPCs might counter with Paper.
      return { 
        prediction: BEATEN_BY[intendedPlayerMove], 
        confidence: 0.33, 
        strategy: 'Default Reaction' 
      };
    }

    const lastRound = this.history[this.history.length - 1];

    // Strategy 1: Sequential Pattern Analysis (N-Gram)
    // We look for patterns in what the NPC does AFTER the current player choice
    const patterns = this.findMatchingNpcMoves(intendedPlayerMove);
    if (patterns.length > 0) {
      const counts: Record<Choice, number> = { rock: 0, paper: 0, scissors: 0 };
      patterns.forEach(move => counts[move]++);
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      const [topChoice, count] = sorted[0];
      
      if (count > patterns.length * 0.4) {
        return { 
          prediction: topChoice as Choice, 
          confidence: count / patterns.length, 
          strategy: 'Contextual Pattern' 
        };
      }
    }

    // Strategy 2: "Stay or Shift" - Does the NPC repeat moves?
    const lastNpcMove = lastRound.npcMove;
    const sameMoveCount = this.history.filter(h => h.npcMove === lastNpcMove).length;
    if (sameMoveCount > this.history.length * 0.6) {
      return { 
        prediction: lastNpcMove, 
        confidence: 0.5, 
        strategy: 'Stability Bias' 
      };
    }

    // Strategy 3: Rotational Detection (Rock -> Paper -> Scissors)
    if (this.history.length >= 2) {
      const p1 = this.history[this.history.length - 2].npcMove;
      const p2 = this.history[this.history.length - 1].npcMove;
      
      if (BEATEN_BY[p1] === p2) {
        return { 
          prediction: BEATEN_BY[p2], 
          confidence: 0.7, 
          strategy: 'Positive Rotation' 
        };
      }
    }

    // Strategy 4: Counter-Intent (Default assumption: NPC tries to beat player)
    return { 
      prediction: BEATEN_BY[intendedPlayerMove], 
      confidence: 0.4, 
      strategy: 'Predictive Reaction' 
    };
  }

  private findMatchingNpcMoves(targetPlayerMove: Choice): Choice[] {
    const matches: Choice[] = [];
    // We look for every time the player played this choice before, what did the npc play?
    for (let i = 0; i < this.history.length; i++) {
        if (this.history[i].playerMove === targetPlayerMove) {
            matches.push(this.history[i].npcMove);
        }
    }
    return matches;
  }
}
